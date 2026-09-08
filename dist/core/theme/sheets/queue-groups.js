// queue-groups styles. Order is preserved by card-styles.js.
export default function() {
  return `.theme-light .queue-flow-item {
          color:#172033;
        }
        .theme-light .queue-flow-caption {
          color:#172033;
          text-shadow:0 2px 10px rgba(255,255,255,.46);
        }
        .theme-light .queue-flow-art {
          background:rgba(255,255,255,.78);
          box-shadow:0 24px 50px rgba(70,88,112,.22);
        }
        .theme-light .queue-flow-item.active .queue-flow-art {
          box-shadow:
            0 24px 50px rgba(70,88,112,.22),
            0 0 30px color-mix(in srgb, var(--ma-accent) 22%, transparent);
        }
        .theme-light .queue-flow-caption-artist {
          color:#617086;
        }
        .card.layout-tablet .queue-page-head {
          width:min(100%, 760px);
          margin:0 auto 14px;
        }
        .card.layout-tablet .queue-list {
          width:min(100%, 760px);
          margin:0 auto;
          gap:10px;
        }
        .queue-page-head {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          margin-bottom:10px;
        }
        .queue-page-head-title {
          font-size:15px;
          font-weight:900;
          letter-spacing:.02em;
        }
        .queue-page-head-actions {
          display:flex;
          align-items:center;
          gap:8px;
          flex:0 0 auto;
          min-width:0;
        }
        .queue-page-count {
          margin-inline-start:auto;
          display:inline-flex;
          align-items:center;
          gap:7px;
          min-height:42px;
          padding:0 12px;
          border-radius:14px;
          background:rgba(255,255,255,.065);
          border:1px solid rgba(255,255,255,.11);
          color:rgba(255,255,255,.78);
          font-size:11px;
          font-weight:850;
        }
        .queue-page-count strong {
          color:var(--ma-accent);
          font-size:14px;
          font-weight:950;
        }
        .queue-head-transfer-btn {
          min-width:0;
          height:42px;
          border:none;
          border-radius:14px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
          color:inherit;
          cursor:pointer;
          backdrop-filter:blur(16px);
          -webkit-backdrop-filter:blur(16px);
          padding:0 12px;
          gap:5px;
          font-size:11px;
          font-weight:900;
        }
        .queue-head-flow-btn {
          min-width:0;
          padding:0 12px;
          color:var(--ma-accent);
        }
        .queue-head-flow-btn .queue-head-transfer-label {
          display:inline;
        }
        .queue-head-flow-btn .ui-ic,
        .queue-head-transfer-btn .ui-ic {
          width:18px;
          height:18px;
        }
        .queue-head-transfer-label {
          white-space:nowrap;
          line-height:1;
        }
        .queue-head-transfer-count {
          line-height:1;
          color:var(--ma-accent);
          font-size:12px;
          font-weight:900;
        }
        .theme-light .queue-head-transfer-btn {
          background:rgba(255,255,255,.78);
          border-color:rgba(147,161,183,.2);
        }
        .theme-light .queue-page-count {
          background:rgba(255,255,255,.82);
          border-color:rgba(147,161,183,.2);
          color:#4c5b70;
        }
        .queue-row {
          display:grid;
          grid-template-columns:18px 46px minmax(0,1fr) auto;
          grid-template-areas:
            "idx thumb meta actions"
            "inline inline inline inline";
          align-items:center;
          cursor:pointer;
          min-height:58px;
          padding:7px 11px;
          row-gap:0;
          column-gap:9px;
          border-radius:18px;
        }
        .card.layout-tablet .queue-row {
          min-height:74px;
          padding:10px 14px;
          border-radius:22px;
          grid-template-columns:48px minmax(0,1fr) 56px;
          grid-template-areas:
            "actions meta thumb"
            "inline inline inline";
          column-gap:14px;
        }
        .queue-row.expanded {
          min-height:132px;
          row-gap:8px;
          padding-bottom:10px;
          overflow:visible;
          background:color-mix(in srgb, var(--ma-soft) 88%, transparent);
          box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--ma-accent) 22%, transparent);
        }
        .card.layout-tablet .queue-row.expanded {
          min-height:136px;
        }
        .queue-row .menu-thumb { grid-area:thumb; }
        .queue-thumb-stack {
          grid-area:thumb;
          display:grid;
          justify-items:center;
          align-items:start;
          gap:5px;
          min-width:0;
          align-self:center;
        }
        .queue-thumb-stack .menu-thumb {
          grid-area:auto;
        }
        .queue-row .menu-thumb {
          width:42px;
          height:42px;
          border-radius:14px;
        }
        .card.layout-tablet .queue-row .menu-thumb {
          width:56px;
          height:56px;
          border-radius:18px;
          justify-self:end;
        }
        .queue-thumb-like {
          display:none;
          width:34px;
          height:30px;
          min-width:34px;
          min-height:30px;
          padding:0;
          border-radius:11px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.065);
          color:rgba(255,255,255,.84);
          align-items:center;
          justify-content:center;
          cursor:pointer;
          box-shadow:none;
        }
        .queue-row.expanded .queue-thumb-like {
          display:inline-flex;
        }
        .queue-thumb-like.active {
          border-color:color-mix(in srgb, #ff5d8f 58%, rgba(255,255,255,.18));
          background:
            radial-gradient(circle at 50% 36%, rgba(255,255,255,.24), transparent 42%),
            linear-gradient(135deg, rgba(255,93,143,.34), rgba(255,93,143,.16));
          color:#ff5d8f;
          box-shadow:
            0 0 0 1px rgba(255,93,143,.12),
            0 10px 24px rgba(255,93,143,.2);
        }
        .queue-thumb-like .ui-ic {
          width:16px;
          height:16px;
        }
        .queue-thumb-like.active .ui-ic path {
          fill:currentColor;
          stroke:currentColor;
        }
        .theme-light .queue-thumb-like {
          border-color:rgba(147,161,183,.18);
          background:rgba(255,255,255,.74);
          color:#4b586b;
        }
        .theme-light .queue-thumb-like.active {
          border-color:rgba(233,64,117,.34);
          background:linear-gradient(135deg, rgba(255,93,143,.22), rgba(255,255,255,.82));
          color:#e94075;
        }
        .card.layout-tablet .queue-thumb-like {
          width:38px;
          height:32px;
          min-width:38px;
          min-height:32px;
          border-radius:12px;
        }
        .queue-index {
          grid-area:idx;
          width:20px;
          padding-top:0;
          align-self:center;
          margin-top:0;
          text-align:center;
          font-size:12px;
          color:rgba(255,255,255,.58);
          flex-shrink:0;
        }
        .card.layout-tablet .queue-index {
          display:none;
        }
        .queue-meta { grid-area:meta; min-width:0; flex:1; padding-inline-end:4px; }
        .card.layout-tablet .queue-meta { padding-inline-end:0; }
        .queue-actions { grid-area:actions; display:flex; gap:8px; flex-wrap:nowrap; direction:ltr; margin-top:0; align-items:center; }
        .card.layout-tablet .queue-actions { justify-self:start; }
        .queue-actions .chip-btn { min-width:34px; min-height:34px; width:34px; border-radius:12px; font-size:14px; font-weight:800; padding:0; }
        .card.layout-tablet .queue-actions .chip-btn { min-width:42px; min-height:42px; width:42px; border-radius:14px; }
        .queue-actions .chip-btn.warn { color:#ffcf86; }
        .queue-inline-actions {
          grid-area:inline;
          display:flex;
          justify-content:flex-end;
          align-items:center;
          gap:6px;
          width:100%;
          max-height:0;
          opacity:0;
          overflow:hidden;
          transform:translateY(-4px);
          pointer-events:none;
          padding:0;
          border-radius:16px;
          border:1px solid transparent;
          background:transparent;
          transition:max-height 180ms ease, opacity 160ms ease, transform 180ms ease, padding 180ms ease, border-color 180ms ease, background-color 180ms ease;
          direction:ltr;
        }
        .queue-row.expanded .queue-inline-actions {
          max-height:58px;
          opacity:1;
          transform:translateY(0);
          pointer-events:auto;
          padding:5px;
          border-color:rgba(255,255,255,.11);
          background:rgba(255,255,255,.055);
        }
        .queue-inline-actions .chip-btn {
          min-width:0;
          width:auto;
          min-height:34px;
          height:34px;
          border-radius:12px;
          padding:0 10px;
          font-size:11.5px;
          font-weight:900;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:4px;
          border:1px solid rgba(255,255,255,.11);
          background:rgba(255,255,255,.06);
          box-shadow:none;
          color:rgba(255,255,255,.86);
          flex:0 0 38px;
        }
        .queue-inline-actions .chip-btn.primary {
          flex:1 1 96px;
          max-width:132px;
          border-color:color-mix(in srgb, var(--ma-accent) 44%, rgba(255,255,255,.14));
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 90%, white 10%), color-mix(in srgb, var(--ma-accent) 70%, black 30%));
          color:#111827;
          box-shadow:0 8px 18px color-mix(in srgb, var(--ma-accent) 20%, transparent);
        }
        .queue-inline-actions .chip-btn.secondary {
          flex:1 1 118px;
          max-width:150px;
          color:rgba(255,255,255,.9);
        }
        .queue-inline-actions .chip-btn.text-action {
          flex:1 1 104px;
          max-width:150px;
          padding:0 10px;
          letter-spacing:0;
        }
        .queue-inline-actions .chip-btn.queue-inline-like {
          flex:0 0 42px;
          width:42px;
          min-width:42px;
          padding:0;
          color:rgba(255,255,255,.9);
        }
        .queue-inline-actions .chip-btn.queue-inline-like.active {
          border-color:color-mix(in srgb, #ff5d8f 58%, rgba(255,255,255,.18));
          background:linear-gradient(135deg, rgba(255,93,143,.28), rgba(255,93,143,.12));
          color:#ff5d8f;
          box-shadow:0 0 0 1px rgba(255,93,143,.10), 0 8px 18px rgba(255,93,143,.16);
        }
        .queue-inline-actions .chip-btn.queue-inline-like.active .ui-ic path {
          fill:currentColor;
          stroke:currentColor;
        }
        .queue-inline-actions .chip-btn.move-action {
          flex:0 0 58px;
          width:58px;
        }
        .queue-inline-move {
          flex:0 0 74px;
        }
        .queue-inline-move input {
          height:34px;
          border-radius:12px;
        }
        .queue-inline-actions .chip-btn.icon-only {
          padding:0;
        }
        .queue-inline-actions .chip-btn.warn {
          flex:0 0 46px;
          width:46px;
          border-color:rgba(255,96,96,.26);
          background:rgba(255,74,74,.13);
          color:#ff8f8f;
          box-shadow:none;
        }
        .queue-inline-actions .ui-ic {
          width:15px;
          height:15px;
          display:block;
          margin:auto;
        }
        .queue-inline-actions .chip-btn span {
          min-width:0;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .queue-eq {
          display:inline-flex;
          align-items:flex-end;
          justify-content:center;
          gap:2px;
          width:16px;
          height:14px;
          margin-inline:auto;
          color:var(--ma-accent);
        }
        .queue-eq span {
          width:2px;
          border-radius:999px;
          background:currentColor;
          animation:eqPulse 1.15s ease-in-out infinite;
          transform-origin:center bottom;
        }
        .queue-eq span:nth-child(1) { height:7px; animation-delay:0s; }
        .queue-eq span:nth-child(2) { height:12px; animation-delay:.18s; }
        .queue-eq span:nth-child(3) { height:8px; animation-delay:.36s; }
        .player-menu-card {
          position:relative;
          display:grid;
          gap:14px;
          padding:16px;
          border-radius:28px;
          background:
            linear-gradient(135deg, rgba(255,255,255,.12), rgba(255,255,255,.04)),
            radial-gradient(circle at 16% 18%, color-mix(in srgb, var(--ma-accent) 16%, transparent), transparent 34%);
          border:1px solid rgba(255,255,255,.14);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          box-shadow:0 18px 34px rgba(0,0,0,.14);
        }
        .card.layout-tablet .player-menu-card,
        .card.layout-tablet .group-player-card {
          gap:7px;
          padding:18px 14px 10px;
          border-radius:22px;
          min-height:0;
        }
        .theme-light .player-menu-card {
          background:
            linear-gradient(135deg, rgba(255,255,255,.94), rgba(245,248,252,.82)),
            radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--ma-accent) 16%, transparent), transparent 34%);
          border-color:rgba(147,161,183,.2);
          box-shadow:0 18px 34px rgba(111,126,150,.12);
        }
        .player-menu-card.active {
          background:
            linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 18%, rgba(255,255,255,.08)), rgba(255,255,255,.08)),
            radial-gradient(circle at 16% 18%, color-mix(in srgb, var(--ma-accent) 18%, transparent), transparent 34%);
          border-color:color-mix(in srgb, var(--ma-accent) 34%, rgba(255,255,255,.14));
          box-shadow:0 18px 36px color-mix(in srgb, var(--ma-accent) 20%, rgba(0,0,0,.18));
        }
        .theme-light .player-menu-card.active {
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 18%, rgba(255,255,255,.78)), rgba(255,255,255,.82));
          border-color:color-mix(in srgb, var(--ma-accent) 30%, rgba(147,161,183,.2));
        }
        .player-menu-card .menu-list-item {
          min-height:0;
          padding:0;
          background:transparent;
          border:none;
          box-shadow:none;
        }
        .player-menu-card .menu-thumb {
          width:48px;
          height:48px;
          border-radius:16px;
        }
        .player-menu-card .menu-thumb .ui-ic {
          width:46%;
          height:46%;
          opacity:.72;
        }
        .player-volume-row {
          display:grid;
          grid-template-columns:auto minmax(0,1fr) auto;
          align-items:center;
          gap:7px;
          min-height:34px;
          padding:2px 4px;
          border-radius:14px;
          background:rgba(255,255,255,.04);
        }
        .card.layout-tablet .player-volume-row {
          min-height:34px;
          padding:2px 6px;
          gap:8px;
          grid-template-columns:30px minmax(0,1fr) 36px;
        }
        .player-menu-card.active .player-volume-row {
          background:color-mix(in srgb, var(--ma-accent) 10%, transparent);
        }
        .player-mini-mute {
          width:30px;
          height:30px;
          border:none;
          border-radius:12px;
          display:grid;
          place-items:center;
          color:inherit;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
          cursor:pointer;
        }
        .player-mini-mute.active {
          color:#fff7e8;
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 34%, transparent), color-mix(in srgb, var(--ma-accent) 18%, transparent));
          border-color:color-mix(in srgb, var(--ma-accent) 40%, transparent);
        }
        .player-mini-mute .ui-ic { width:15px; height:15px; }
        .player-mini-volume {
          width:100%;
          appearance:none;
          height:5px;
          border-radius:999px;
          outline:none;
          background:linear-gradient(to right,var(--ma-accent) 0%,var(--ma-accent) var(--vol-pct,50%),rgba(255,255,255,.2) var(--vol-pct,50%),rgba(255,255,255,.2) 100%);
        }
        .player-mini-volume::-webkit-slider-thumb { appearance:none; width:11px; height:11px; border-radius:50%; background:var(--ma-accent); border:none; }
        .player-mini-volume::-moz-range-thumb { width:11px; height:11px; border-radius:50%; background:var(--ma-accent); border:none; }
        .player-mini-value {
          display:block;
          min-width:34px;
          text-align:end;
          font-size:11px;
          font-weight:800;
          color:rgba(255,255,255,.78);
        }
        .theme-light .player-mini-mute {
          color:#1f2633;
          background:rgba(255,255,255,.74);
          border-color:rgba(147,161,183,.2);
        }
        .theme-light .player-mini-mute.active {
          color:#8b5e12;
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 18%, white 82%), color-mix(in srgb, var(--ma-accent) 10%, white 90%));
        }
        .theme-light .player-mini-value { color:#4b5c73; }
        .players-premium-grid {
          display:grid;
          grid-template-columns:minmax(0, 1fr);
          gap:14px;
        }
        .card.layout-tablet .players-premium-grid {
          grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:16px;
          width:min(100%, 720px);
          margin:0 auto;
        }
        .card.layout-tablet.rtl .players-premium-grid {
          direction:rtl;
        }
        .card.layout-tablet .menu-body {
          padding:18px 20px 22px;
        }
        .card.layout-tablet .menu-body.sheet-actions,
        .card.layout-tablet .menu-body.sheet-schedules,
        .card.layout-tablet .menu-body.sheet-players,
        .card.layout-tablet .menu-body.sheet-queue,
        .card.layout-tablet .menu-body.sheet-transfer,
        .card.layout-tablet .menu-body.sheet-group,
        .card.layout-tablet .menu-body.sheet-announcements,
        .card.layout-tablet .menu-body.sheet-settings {
          justify-items:center;
        }
        .card.layout-tablet .action-grid {
          display:grid;
          grid-template-columns:repeat(2, minmax(0,1fr));
          gap:10px;
          align-content:start;
          width:min(100%, 660px);
          margin:0 auto;
        }
        .card.layout-tablet .action-grid .menu-item {
          min-height:114px;
          border-radius:22px;
        }
        .theme-light .card.layout-tablet .action-grid .menu-item {
          box-shadow:0 16px 30px rgba(110,127,153,.12);
        }
        .card.layout-tablet .action-grid .menu-item-main {
          gap:12px;
          align-items:center;
        }
        .card.layout-tablet .action-grid .menu-item-ico {
          width:50px;
          height:50px;
          border-radius:16px;
        }
        .card.layout-tablet .action-grid .menu-item-title {
          font-size:18px;
          font-weight:900;
          letter-spacing:-.02em;
        }
        .card.layout-tablet .player-menu-card {
          min-height:142px;
          padding:20px 16px 10px;
          border-radius:26px;
          background:
            linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.06)),
            radial-gradient(circle at top, color-mix(in srgb, var(--ma-accent) 10%, transparent), transparent 55%);
          border:1px solid rgba(255,255,255,.12);
          box-shadow:0 18px 40px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.08);
          gap:8px;
        }
        .theme-light .card.layout-tablet .player-menu-card,
        .theme-light .card.layout-tablet .group-player-card {
          background:rgba(255,255,255,.5);
          border-color:rgba(147,161,183,.18);
          box-shadow:0 16px 30px rgba(110,127,153,.12);
        }
        .card.layout-tablet .player-premium-head {
          grid-template-columns:58px minmax(0,1fr);
          gap:14px;
          padding:10px 50px 0 0;
          align-items:center;
        }
        .card.layout-tablet .player-menu-card .menu-thumb {
          width:58px;
          height:58px;
          border-radius:20px;
        }
        .card.layout-tablet .player-premium-name {
          font-size:17px;
          line-height:1.12;
          letter-spacing:-.02em;
        }
        .card.layout-tablet .player-premium-track {
          font-size:13px;
          line-height:1.35;
          color:rgba(255,255,255,.62);
        }
        .theme-light .card.layout-tablet .player-premium-track {
          color:rgba(31,38,51,.58);
        }
        .card.layout-tablet .player-premium-side {
          display:none;
        }
        .card.layout-tablet .player-mini-mute {
          width:26px;
          height:26px;
          border-radius:10px;
        }
        .card.layout-tablet .player-mini-mute .ui-ic { width:13px; height:13px; }
        .card.layout-tablet .player-mini-volume {
          height:5px;
        }
        .card.layout-tablet .player-mini-value {
          display:block;
        }
        .player-premium-head {
          width:100%;
          border:none;
          background:transparent;
          padding:10px 50px 0 0;
          display:grid;
          grid-template-columns:auto minmax(0,1fr) auto;
          gap:12px;
          align-items:center;
          color:inherit;
          text-align:inherit;
          cursor:pointer;
          position:relative;
        }
        .player-premium-art {
          position:relative;
          width:66px;
          height:66px;
          border-radius:20px;
          overflow:hidden;
          display:grid;
          place-items:center;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
          box-shadow:0 12px 24px rgba(0,0,0,.14);
        }
        .player-premium-art img { width:100%; height:100%; object-fit:cover; display:block; }
        .player-premium-art .ui-ic { width:46%; height:46%; opacity:.68; }
        .player-premium-copy {
          min-width:0;
          display:grid;
          gap:5px;
        }
        .player-premium-kicker {
          font-size:11px;
          font-weight:900;
          letter-spacing:.04em;
          text-transform:uppercase;
          color:rgba(255,255,255,.54);
        }
        .card.layout-tablet .player-premium-art {
          width:60px;
          height:60px;
          border-radius:18px;
        }
        .player-premium-name {
          font-size:20px;
          font-weight:650;
          line-height:1.15;
          color:inherit;
        }
        .card.layout-tablet .player-premium-name {
          font-size:19px;
        }
        .player-premium-meta {
          display:flex;
          align-items:center;
          gap:8px;
          flex-wrap:wrap;
          color:var(--muted);
          font-size:12px;
          font-weight:800;
        }
        .player-premium-track {
          min-width:0;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          margin-top:2px;
          font-size:13px;
          font-weight:650;
          line-height:1.28;
          color:rgba(255,255,255,.62);
        }
        .card.layout-tablet .player-premium-track {
          font-size:12px;
        }
        .player-premium-state {
          display:inline-flex;
          align-items:center;
          gap:6px;
          padding:5px 10px;
          border-radius:999px;
          background:color-mix(in srgb, var(--ma-accent) 12%, rgba(255,255,255,.08));
          color:var(--ma-accent);
          border:1px solid color-mix(in srgb, var(--ma-accent) 22%, rgba(255,255,255,.12));
          width:max-content;
          max-width:100%;
        }
        .player-premium-state.idle {
          color:#58d68d;
          background:rgba(54,183,113,.14);
          border-color:rgba(88,214,141,.28);
        }
        .player-premium-state.playing {
          color:#ff6f6f;
          background:rgba(221,62,62,.16);
          border-color:rgba(255,111,111,.3);
        }
        .player-premium-state .eq-icon { margin:0; width:14px; height:12px; }
        .player-premium-side {
          position:absolute;
          top:10px;
          right:12px;
          left:auto;
          bottom:auto;
          display:grid;
          place-items:center;
          pointer-events:none;
          z-index:2;
        }
        .player-front-pin {
          width:27px;
          height:27px;
          padding:0;
          appearance:none;
          -webkit-appearance:none;
          border-radius:0;
          display:grid;
          place-items:center;
          color:rgba(210,216,226,.52);
          background:transparent;
          border:0;
          box-shadow:none;
          cursor:pointer;
          opacity:.78;
          pointer-events:auto;
          transition:transform .15s ease, opacity .15s ease, color .15s ease, filter .15s ease;
        }
        .player-front-pin:hover,
        .player-front-pin:focus-visible {
          opacity:1;
          transform:translateY(-1px);
          color:rgba(245,248,255,.82);
        }
        .player-front-pin.active {
          color:rgb(var(--dynamic-accent-rgb, 224 161 27));
          background:transparent;
          filter:drop-shadow(0 0 8px rgba(var(--dynamic-accent-rgb, 224 161 27) / .34));
          opacity:1;
        }
        .player-front-pin .ui-ic {
          width:17px;
          height:17px;
        }
        .theme-light .player-front-pin {
          color:rgba(74,84,100,.58);
          background:transparent;
          border:0;
          box-shadow:none;
        }
        .theme-light .player-front-pin.active {
          color:rgb(var(--dynamic-accent-rgb, 224 161 27));
          background:transparent;
        }
        .card.layout-tablet .player-premium-side {
          display:grid;
        }
        .player-favorite-btn {
          width:36px;
          min-width:36px;
          min-height:36px;
          padding:0;
          border-radius:14px;
          display:grid;
          place-items:center;
        }
        .player-favorite-btn .ui-ic { width:18px; height:18px; }
        .player-premium-active {
          min-width:32px;
          height:28px;
          padding:0 10px;
          border-radius:999px;
          display:grid;
          place-items:center;
          font-size:12px;
          font-weight:950;
          color:var(--ma-accent);
          background:color-mix(in srgb, var(--ma-accent) 12%, rgba(255,255,255,.08));
          border:1px solid color-mix(in srgb, var(--ma-accent) 22%, rgba(255,255,255,.12));
        }
        .player-menu-card.active .player-premium-name {
          color:color-mix(in srgb, var(--ma-accent) 42%, currentColor);
        }
        .theme-light .player-premium-art {
          background:rgba(255,255,255,.88);
          border-color:rgba(147,161,183,.2);
        }
        .theme-light .player-premium-state,
        .theme-light .player-premium-active {
          background:color-mix(in srgb, var(--ma-accent) 12%, rgba(255,255,255,.86));
          border-color:color-mix(in srgb, var(--ma-accent) 18%, rgba(147,161,183,.18));
        }
        .theme-light .player-premium-state.idle {
          color:#138a54;
          background:rgba(46,178,112,.13);
          border-color:rgba(34,154,96,.24);
        }
        .theme-light .player-premium-state.playing {
          color:#c83e43;
          background:rgba(216,72,78,.13);
          border-color:rgba(196,59,65,.24);
        }
        .theme-light .player-premium-kicker {
          color:rgba(55,68,85,.52);
        }
        .liked-toolbar {
          display:flex;
          flex-wrap:wrap;
          align-items:center;
          justify-content:space-between;
          gap:10px;
          margin-bottom:12px;
        }
        .liked-toolbar-actions {
          display:flex;
          flex-wrap:wrap;
          align-items:center;
          gap:10px;
          min-width:0;
        }
        .liked-layout-toggle {
          margin-inline-start:auto;
        }
        .card.layout-tablet .liked-toolbar {
          width:min(100%, 940px);
          margin:0 auto 16px;
          align-items:center;
        }
        .card.layout-tablet .liked-layout-toggle {
          background:transparent!important;
          border:none!important;
          box-shadow:none!important;
          padding:0!important;
          gap:8px!important;
          backdrop-filter:none!important;
          -webkit-backdrop-filter:none!important;
        }
        .card.layout-tablet .liked-layout-toggle .media-layout-btn {
          width:44px;
          min-width:44px;
          height:44px;
          min-height:44px;
          border-radius:999px!important;
          background:rgba(255,255,255,.09);
          border:1px solid rgba(255,255,255,.12);
        }
        .liked-select-box {
          width:22px;
          min-width:22px;
          height:22px;
          display:grid;
          place-items:center;
          flex-shrink:0;
          cursor:pointer;
          user-select:none;
        }
        .liked-select-box input {
          position:absolute;
          opacity:0;
          pointer-events:none;
          width:1px;
          height:1px;
        }
        .liked-select-box span {
          width:18px;
          height:18px;
          border-radius:5px;
          border:2px solid rgba(255,255,255,.32);
          background:rgba(255,255,255,.06);
          display:grid;
          place-items:center;
          transition:transform .16s ease, border-color .16s ease, background .16s ease, box-shadow .16s ease;
        }
        .liked-select-box.checked span {
          background:color-mix(in srgb, var(--ma-accent) 18%, rgba(255,255,255,.08));
          border-color:color-mix(in srgb, var(--ma-accent) 70%, rgba(255,255,255,.24));
          box-shadow:0 10px 20px color-mix(in srgb, var(--ma-accent) 24%, transparent);
          transform:scale(1.04);
        }
        .liked-select-box.checked span::before {
          content:"?";
          color:var(--ma-accent);
          font-size:13px;
          font-weight:1000;
          line-height:1;
        }
        .media-entry.grid.liked-entry .liked-select-box {
          position:absolute;
          inset-block-start:18px;
          inset-inline-start:54px;
          z-index:4;
          width:34px;
          min-width:34px;
          height:34px;
        }
        .media-entry.grid.liked-entry .liked-select-box span {
          width:22px;
          height:22px;
          border-radius:8px;
          background:rgba(13,16,23,.44);
          backdrop-filter:blur(10px);
          -webkit-backdrop-filter:blur(10px);
        }
        .theme-light .liked-select-box span {
          border-color:rgba(55,68,85,.28);
          background:rgba(255,255,255,.88);
        }
        .theme-light .media-entry.grid.liked-entry .liked-select-box span {
          background:rgba(255,255,255,.82);
        }
        .liked-remove-btn { min-width:40px; min-height:38px; border-radius:14px; font-size:15px; font-weight:900; color:#ffcf86; flex-shrink:0; }
        .group-connected-row {
          display:grid;
          gap:6px;
          padding:12px 14px;
          border-radius:18px;
          background:color-mix(in srgb, var(--ma-accent) 12%, rgba(255,255,255,.08));
          border:1px solid color-mix(in srgb, var(--ma-accent) 22%, rgba(255,255,255,.12));
          color:inherit;
        }
        .group-connected-row span {
          font-size:12px;
          font-weight:800;
          color:rgba(255,255,255,.66);
        }
        .group-connected-row strong {
          font-size:15px;
          line-height:1.35;
          font-weight:900;
        }
        .theme-light .group-connected-row {
          background:color-mix(in srgb, var(--ma-accent) 12%, rgba(255,255,255,.76));
          border-color:color-mix(in srgb, var(--ma-accent) 20%, rgba(147,161,183,.2));
        }
        .theme-light .group-connected-row span { color:rgba(55,68,85,.64); }
        .group-change-row {
          min-height:38px;
          border-radius:16px;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:0 14px;
          font-size:12px;
          font-weight:900;
          color:var(--ma-accent);
          background:color-mix(in srgb, var(--ma-accent) 13%, rgba(255,255,255,.07));
          border:1px solid color-mix(in srgb, var(--ma-accent) 22%, rgba(255,255,255,.12));
        }
        .theme-light .group-change-row {
          background:color-mix(in srgb, var(--ma-accent) 12%, rgba(255,255,255,.82));
          border-color:color-mix(in srgb, var(--ma-accent) 20%, rgba(147,161,183,.2));
        }
        .group-volume-card {
          display:grid;
          gap:10px;
          padding:14px;
          border-radius:20px;
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 14%, rgba(255,255,255,.08)), rgba(255,255,255,.06));
          border:1px solid color-mix(in srgb, var(--ma-accent) 24%, rgba(255,255,255,.12));
          box-shadow:0 16px 34px rgba(0,0,0,.12);
        }
        .theme-light .group-volume-card {
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 16%, rgba(255,255,255,.82)), rgba(255,255,255,.78));
          border-color:color-mix(in srgb, var(--ma-accent) 22%, rgba(147,161,183,.22));
        }
        .group-volume-title {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          font-size:15px;
          font-weight:950;
        }
        .group-volume-title span {
          min-width:34px;
          height:28px;
          border-radius:999px;
          display:grid;
          place-items:center;
          color:var(--ma-accent);
          background:color-mix(in srgb, var(--ma-accent) 12%, rgba(255,255,255,.1));
          border:1px solid color-mix(in srgb, var(--ma-accent) 22%, rgba(255,255,255,.12));
          font-size:13px;
          font-weight:950;
        }
        .group-player-card {
          position:relative;
          display:grid;
          gap:10px;
          padding:12px;
          border-radius:20px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
        }
        .theme-light .group-player-card {
          background:rgba(255,255,255,.78);
          border-color:rgba(147,161,183,.18);
        }
        .group-player-card.connected,
        .group-player-card.will-add {
          border-color:color-mix(in srgb, var(--ma-accent) 34%, rgba(255,255,255,.14));
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 14%, rgba(255,255,255,.09)), rgba(255,255,255,.065));
        }
        .group-player-card.will-remove {
          border-color:rgba(255,190,116,.34);
          background:linear-gradient(135deg, rgba(255,190,116,.12), rgba(255,255,255,.055));
        }
        .theme-light .group-player-card.connected,
        .theme-light .group-player-card.will-add {
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 14%, rgba(255,255,255,.86)), rgba(255,255,255,.78));
          border-color:color-mix(in srgb, var(--ma-accent) 30%, rgba(147,161,183,.24));
        }
        .theme-light .group-player-card.will-remove {
          background:linear-gradient(135deg, rgba(255,190,116,.18), rgba(255,255,255,.8));
          border-color:rgba(205,137,52,.34);
        }
        .group-player-card .group-player-row {
          position:relative;
          padding:10px 50px 0 0;
          background:transparent;
          border:none;
          box-shadow:none;
        }
        .group-player-card .player-premium-head {
          align-items:flex-start;
        }
        .group-player-toggle {
          position:absolute;
          top:6px;
          right:7px;
          left:auto;
          bottom:auto;
          width:29px;
          height:29px;
          border-radius:0;
          display:inline-grid;
          place-items:center;
          border:0;
          background:transparent;
          color:rgba(210,216,226,.64);
          box-shadow:none;
          opacity:.9;
          z-index:2;
          pointer-events:none;
          transition:transform .15s ease, opacity .15s ease, color .15s ease, filter .15s ease;
        }
        .group-player-toggle.checked {
          color:rgb(var(--dynamic-accent-rgb, 224 161 27));
          filter:drop-shadow(0 0 8px rgba(var(--dynamic-accent-rgb, 224 161 27) / .34));
          opacity:1;
        }
        .group-player-toggle .ui-ic {
          width:18px;
          height:18px;
        }
        .theme-light .group-player-toggle {
          color:rgba(74,84,100,.62);
        }
        .theme-light .group-player-toggle.checked {
          color:rgb(var(--dynamic-accent-rgb, 224 161 27));
        }
        .group-player-card.will-remove .group-player-toggle {
          color:#ffcf86;
          filter:drop-shadow(0 0 8px rgba(255,207,134,.28));
        }
        .group-player-status {
          width:max-content;
          max-width:100%;
          min-height:22px;
          border-radius:999px;
          display:inline-flex;
          align-items:center;
          padding:0 9px;
          margin-top:5px;
          font-size:10.5px;
          font-weight:950;
          color:rgba(255,255,255,.7);
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.1);
        }
        .group-player-status.connected,
        .group-player-status.will-add,
        .group-player-status.master {
          color:var(--ma-accent);
          background:color-mix(in srgb, var(--ma-accent) 13%, rgba(255,255,255,.08));
          border-color:color-mix(in srgb, var(--ma-accent) 22%, rgba(255,255,255,.12));
        }
        .group-player-status.will-remove,
        .group-player-status.will-clear {
          color:#ffcf86;
          background:rgba(255,207,134,.1);
          border-color:rgba(255,207,134,.18);
        }
        .theme-light .group-player-status {
          color:rgba(55,68,85,.68);
          background:rgba(242,246,250,.75);
          border-color:rgba(147,161,183,.2);
        }
        .theme-light .group-player-status.connected,
        .theme-light .group-player-status.will-add,
        .theme-light .group-player-status.master {
          color:rgb(var(--dynamic-accent-rgb, 224 161 27));
          background:color-mix(in srgb, var(--ma-accent) 12%, rgba(255,255,255,.82));
        }
        .theme-light .group-player-status.will-remove,
        .theme-light .group-player-status.will-clear {
          color:#b46b20;
          background:rgba(255,207,134,.22);
          border-color:rgba(205,137,52,.22);
        }
        .group-player-check {
          position:absolute!important;
          width:1px!important;
          height:1px!important;
          opacity:0!important;
          pointer-events:none!important;
          margin:0!important;
        }
        .group-inline-volume {
          padding:4px;
          background:rgba(255,255,255,.06);
        }
        .theme-light .group-inline-volume { background:rgba(242,246,250,.72); }
        .menu-body.sheet-group .group-actions { width:min(100%, 460px); margin:22px auto 0; display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:12px; }
        .card.layout-tablet .menu-body.sheet-group .group-actions {
          width:min(480px, 100%);
          gap:14px;
          margin-top:26px;
        }
        .menu-body.sheet-group .action-btn { min-height:58px; border-radius:22px; padding:0 22px; font-size:15px; font-weight:850; letter-spacing:0; background:linear-gradient(180deg, rgba(255,255,255,.13), rgba(255,255,255,.055)); border:1px solid rgba(255,255,255,.16); box-shadow:0 14px 26px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.12); }
        .menu-body.sheet-group .action-btn:disabled { opacity:.46; cursor:default; pointer-events:none; box-shadow:none; }
        .menu-body.sheet-group .group-disconnect-all-btn {
          width:100%;
          max-width:100%;
          min-height:58px;
          margin:0;
          padding:0 18px;
          border-radius:22px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:7px;
          font-size:15px;
          font-weight:850;
          letter-spacing:0;
          color:#ffd88b;
          border:1px solid rgba(255,216,139,.22);
          background:rgba(255,216,139,.08);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.1);
        }
        .theme-light .menu-body.sheet-group .group-disconnect-all-btn {
          color:#9a6410;
          border-color:rgba(205,137,52,.2);
          background:rgba(255,207,134,.2);
        }
        .action-btn.busy {
          position:relative;
          display:inline-flex!important;
          align-items:center;
          justify-content:center;
          gap:8px;
          cursor:progress!important;
          pointer-events:none;
          color:var(--ma-accent);
          border-color:rgba(var(--dynamic-accent-rgb, 224 161 27) / .34);
          background:linear-gradient(180deg, rgba(var(--dynamic-accent-rgb, 224 161 27) / .2), rgba(255,255,255,.07));
        }
        .action-btn.busy::before {
          content:"";
          width:14px;
          height:14px;
          border-radius:999px;
          border:2px solid currentColor;
          border-inline-end-color:transparent;
          animation:spin .72s linear infinite;
        }
        .action-btn.busy::after {
          content:"";
          position:absolute;
          inset:-4px;
          border-radius:inherit;
          border:1px solid rgba(var(--dynamic-accent-rgb, 224 161 27) / .28);
          animation:voiceAssistantListenPulse 1s ease-out infinite;
          pointer-events:none;
        }
        .action-btn.busy-connect::before,
        .action-btn.busy-disconnect::before {
          width:28px;
          height:12px;
          border:0;
          border-radius:0;
          background:
            radial-gradient(circle, currentColor 0 4px, transparent 4.4px) left center / 12px 12px no-repeat,
            radial-gradient(circle, currentColor 0 4px, transparent 4.4px) right center / 12px 12px no-repeat,
            linear-gradient(currentColor, currentColor) center / 14px 2px no-repeat;
        }
        .action-btn.busy-connect::before { animation:groupConnectLoad .9s ease-in-out infinite; }
        .action-btn.busy-disconnect::before { animation:groupDisconnectLoad .9s ease-in-out infinite; }
        .action-btn.busy-disconnect::after { border-style:dashed; animation:groupDisconnectAura 1s ease-out infinite; }
        .menu-body.sheet-group .action-btn.warn { color:#ffd88b; border-color:rgba(255,216,139,.22); background:linear-gradient(180deg, rgba(255,216,139,.12), rgba(255,255,255,.055)); }
        @keyframes groupConnectLoad {
          0%,100% { transform:scaleX(.78); opacity:.62; }
          50% { transform:scaleX(1.08); opacity:1; }
        }
        @keyframes groupDisconnectLoad {
          0%,100% { transform:scaleX(1.08); opacity:1; }
          50% { transform:scaleX(.68); opacity:.58; }
        }
        @keyframes groupDisconnectAura {
          0% { opacity:.62; transform:scale(1); }
          100% { opacity:0; transform:scale(1.08); }
        }
        .group-player-row .menu-item-title { font-size:18px; font-weight:900; }
        .group-player-row input[type="checkbox"] {
          position:absolute!important;
          width:1px!important;
          height:1px!important;
          opacity:0!important;
          pointer-events:none!important;
          margin:0!important;
        }
        .settings-shell {
          display:grid;
          grid-template-columns: minmax(0, 1fr);
          gap:16px;
          align-content:start;
          width: 100%;
          box-sizing: border-box;
        }
        .rtl .settings-shell,
        .rtl .settings-card {
          direction:rtl;
          text-align:right;
        }
        .rtl .settings-shell,
        .rtl .settings-group {
          direction:rtl;
          text-align:right;
        }
        .settings-accordion {
          display: block;
          width: 100%;
          min-width: 100%;
          justify-self: stretch;
          grid-column: 1 / -1;
          box-sizing: border-box;
        }
        .settings-accordion-summary {
          list-style: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 18px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.12);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          user-select: none;
          min-height: 24px;
          width: 100%;
          min-width: 100%;
          box-sizing: border-box;
        }
        .theme-light .settings-accordion-summary {
          background: rgba(255,255,255,.72);
          border-color: rgba(147,161,183,.2);
        }
        .settings-accordion-summary::-webkit-details-marker { display: none; }
        .settings-accordion-summary:hover { filter: brightness(1.05); }
        .settings-accordion-title {
          flex: 1;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: .02em;
        }
        `;
}
