// voice styles. Order is preserved by card-styles.js.
export default function() {
  return `.homeii-loading-state.compact {
          min-height:120px;
        }
        .homeii-loading-content {
          display:grid;
          justify-items:center;
          gap:12px;
        }
        .homeii-loading-mark {
          position:relative;
          width:72px;
          height:72px;
          display:grid;
          place-items:center;
          filter:drop-shadow(0 18px 32px rgba(0,0,0,.20));
        }
        .homeii-loading-ring {
          position:absolute;
          inset:8px;
          border-radius:999px;
          border:2px solid rgba(255,255,255,.10);
          border-top-color:color-mix(in srgb, var(--ma-accent) 88%, #fff 8%);
          animation:homeiiLoadingSpin 1.4s linear infinite;
        }
        .homeii-loading-ring.secondary {
          inset:18px;
          opacity:.58;
          animation-duration:2.1s;
          animation-direction:reverse;
        }
        .homeii-loading-core {
          width:15px;
          height:15px;
          border-radius:999px;
          background:var(--ma-accent);
          box-shadow:0 0 26px color-mix(in srgb, var(--ma-accent) 58%, transparent);
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
        .menu-backdrop {
          position:absolute; inset:0; z-index:30; display:none; align-items:stretch; justify-content:center;
          padding:max(30px, env(safe-area-inset-top)) max(10px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(10px, env(safe-area-inset-left));
          background:rgba(8,10,16,.48); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
        }
        .menu-backdrop.open { display:flex; }
        .menu-backdrop.search-open {
          align-items:stretch;
        }
        .card.layout-tablet .menu-backdrop {
          align-items:stretch;
          justify-content:flex-start;
          padding:max(14px, env(safe-area-inset-top)) 14px max(14px, env(safe-area-inset-bottom)) 14px;
        }
        .card.layout-tablet.rtl .menu-backdrop {
          justify-content:flex-start;
        }
        .queue-action-backdrop {
          position:fixed; inset:0; z-index:85; display:none; align-items:center; justify-content:center;
          padding:max(20px, env(safe-area-inset-top)) 16px max(20px, env(safe-area-inset-bottom));
          background:rgba(8,10,16,.28);
          backdrop-filter:blur(12px);
          -webkit-backdrop-filter:blur(12px);
        }
        .queue-action-backdrop.open { display:flex; }
        .queue-action-sheet {
          width:min(100%, 292px);
          max-height:min(78vh, 520px);
          overflow:auto;
          padding:12px;
          border-radius:24px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(17,19,28,.92);
          box-shadow:0 24px 56px rgba(0,0,0,.28);
          display:grid;
          gap:10px;
        }
        .queue-action-sheet.tablet-volume-sheet-host {
          width:min(760px, calc(100cqi - 72px));
          padding:0;
          border:none;
          background:transparent;
          box-shadow:none;
        }
        .theme-light .queue-action-sheet {
          background:rgba(255,255,255,.94);
          border-color:rgba(141,155,177,.22);
          box-shadow:0 18px 38px rgba(111,126,150,.18);
        }
        .queue-action-item {
          min-height:56px;
          border:none;
          border-radius:18px;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:10px;
          padding:12px 14px;
          color:inherit;
          background:transparent;
          font:inherit;
          font-size:14px;
          font-weight:800;
          cursor:pointer;
          text-align:center;
        }
        .queue-action-item.compact {
          min-height:46px;
          border-radius:15px;
          background:rgba(255,255,255,.07);
          border:1px solid rgba(255,255,255,.12);
        }
        .queue-move-control {
          display:grid;
          grid-template-columns:minmax(0,1fr) auto;
          gap:8px;
          align-items:end;
          padding:8px;
          border-radius:18px;
          background:rgba(255,255,255,.055);
          border:1px solid rgba(255,255,255,.1);
        }
        .queue-move-control label,
        .queue-inline-move {
          min-width:0;
          display:grid;
          gap:5px;
          color:rgba(255,255,255,.72);
          font-size:10px;
          font-weight:850;
        }
        .queue-move-control input,
        .queue-inline-move input {
          width:100%;
          min-width:0;
          height:38px;
          border-radius:13px;
          border:1px solid rgba(255,255,255,.14);
          background:rgba(255,255,255,.08);
          color:inherit;
          text-align:center;
          font:inherit;
          font-size:14px;
          font-weight:900;
          outline:none;
        }
        .theme-light .queue-move-control {
          background:rgba(31,38,51,.045);
          border-color:rgba(147,161,183,.2);
        }
        .theme-light .queue-move-control label,
        .theme-light .queue-inline-move {
          color:#5b687c;
        }
        .theme-light .queue-move-control input,
        .theme-light .queue-inline-move input {
          background:rgba(255,255,255,.88);
          border-color:rgba(147,161,183,.24);
          color:#172033;
        }
        .queue-action-item:hover {
          background:rgba(255,255,255,.06);
          transform:translateY(-1px);
        }
        .theme-light .queue-action-item:hover {
          background:rgba(31,38,51,.06);
        }
        .queue-action-item .ui-ic {
          width:16px;
          height:16px;
        }
        .queue-action-item.warn {
          color:#ffcf86;
        }
        .queue-action-item:not(.warn) .ui-ic,
        .queue-action-item:not(.warn) {
          color:var(--ma-accent);
        }
        .queue-action-header {
          display:grid;
          gap:4px;
          padding:8px 10px 10px;
          text-align:center;
          border-bottom:1px solid rgba(255,255,255,.08);
          margin-bottom:4px;
        }
        .queue-action-brand,
        .smart-voice-brand {
          width:118px;
          max-width:56%;
          margin-inline:auto;
          color:rgba(255,255,255,.68);
          opacity:.96;
          display:grid;
          place-items:center;
        }
        .theme-light .queue-action-header {
          border-bottom-color:rgba(141,155,177,.16);
        }
        .theme-light .queue-action-brand,
        .theme-light .smart-voice-brand {
          color:rgba(31,38,51,.48);
        }
        .queue-action-player {
          font-size:11px;
          font-weight:900;
          letter-spacing:.08em;
          text-transform:uppercase;
          color:rgba(255,255,255,.56);
        }
        .theme-light .queue-action-player {
          color:rgba(55,68,85,.54);
        }
        .queue-action-title {
          font-size:16px;
          font-weight:900;
          line-height:1.2;
          color:inherit;
        }
        .confirm-sheet {
          width:min(100%, 460px);
          max-width:calc(100% - 28px);
          min-height:0;
          padding:24px;
        }
        .confirm-copy {
          color:var(--muted);
          line-height:1.75;
          font-size:15px;
        }
        .confirm-actions {
          display:grid;
          grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:12px;
          margin-top:20px;
        }
        .confirm-actions .menu-item {
          min-height:54px;
          justify-content:center;
          text-align:center;
        }
        .clean-all-confirm-backdrop {
          position:absolute;
          z-index:92;
          background:rgba(8,10,16,.24);
          backdrop-filter:blur(10px);
          -webkit-backdrop-filter:blur(10px);
        }
        .clean-all-confirm-sheet {
          position:relative;
          width:min(420px, calc(100vw - 36px));
          max-height:none;
          padding:18px;
          gap:16px;
          border-radius:26px;
          background:rgba(18,21,30,.9);
          box-shadow:0 22px 60px rgba(0,0,0,.3);
        }
        .clean-all-confirm-head {
          display:grid;
          grid-template-columns:48px minmax(0, 1fr);
          gap:14px;
          align-items:start;
          padding-inline-end:40px;
        }
        .clean-all-confirm-icon {
          width:48px;
          height:48px;
          border-radius:18px;
          display:grid;
          place-items:center;
          background:linear-gradient(145deg, rgba(255,85,95,.2), rgba(255,255,255,.06));
          border:1px solid rgba(255,105,115,.24);
        }
        .clean-all-confirm-icon .ui-ic {
          width:22px;
          height:22px;
        }
        .clean-all-confirm-title {
          font-size:18px;
          font-weight:950;
          line-height:1.2;
          color:#fff;
          margin-block-end:6px;
        }
        .clean-all-confirm-close {
          position:absolute;
          inset-block-start:12px;
          inset-inline-end:12px;
          width:34px;
          height:34px;
          border-radius:14px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.08);
          color:#fff;
          font-size:22px;
          line-height:1;
          cursor:pointer;
        }
        .confirm-actions.clean-all-confirm-actions {
          margin-top:0;
        }
        .clean-all-confirm-actions {
          grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:10px;
        }
        .clean-all-confirm-btn {
          min-width:0;
          min-height:46px;
          border-radius:16px;
          border:1px solid rgba(255,255,255,.12);
          display:inline-flex;
          align-items:center;
          justify-content:center;
          padding:0 14px;
          color:#fff;
          background:rgba(255,255,255,.08);
          font-size:14px;
          font-weight:900;
          line-height:1;
          cursor:pointer;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.1);
        }
        .clean-all-confirm-btn.danger-confirm-action {
          color:#ffd9d9;
          background:linear-gradient(145deg, rgba(255,85,95,.24), rgba(255,85,95,.1));
          border:1px solid rgba(255,105,115,.3);
        }
        .danger-confirm-icon {
          color:#ffb6b6;
        }
        .theme-light .clean-all-confirm-btn {
          color:#16202d;
          background:rgba(31,38,51,.06);
          border-color:rgba(31,38,51,.1);
        }
        .theme-light .clean-all-confirm-btn.danger-confirm-action {
          color:#b4232b;
          background:#fff1f2;
          border-color:rgba(180,35,43,.18);
        }
        .theme-light .clean-all-confirm-sheet {
          background:rgba(255,255,255,.94);
          border-color:rgba(141,155,177,.22);
          box-shadow:0 18px 44px rgba(111,126,150,.2);
        }
        .theme-light .clean-all-confirm-title {
          color:#16202d;
        }
        .theme-light .clean-all-confirm-close {
          color:#16202d;
          background:rgba(31,38,51,.06);
          border-color:rgba(31,38,51,.1);
        }
        .theme-light .danger-confirm-icon {
          color:#b4232b;
        }
        .smart-voice-sheet {
          width:min(100%, 520px);
          gap:18px;
        }
        .smart-voice-head {
          display:grid;
          gap:6px;
          text-align:center;
        }
        .smart-voice-title {
          font-size:22px;
          font-weight:950;
        }
        .smart-voice-target {
          color:var(--muted);
          font-size:13px;
          font-weight:800;
        }
        .smart-voice-card {
          display:grid;
          gap:12px;
          padding:18px;
          border-radius:24px;
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.1);
          text-align:center;
        }
        .theme-light .smart-voice-card {
          background:rgba(255,255,255,.82);
          border-color:rgba(147,161,183,.18);
        }
        .smart-voice-chip {
          width:fit-content;
          max-width:100%;
          margin:0 auto;
          display:inline-flex;
          align-items:center;
          gap:8px;
          padding:8px 14px;
          border-radius:999px;
          background:color-mix(in srgb, var(--ma-accent) 14%, rgba(255,255,255,.08));
          color:var(--ma-accent);
          font-size:12px;
          font-weight:900;
        }
        .smart-voice-chip .ui-ic { width:16px; height:16px; }
        .smart-voice-name {
          font-size:24px;
          font-weight:950;
          line-height:1.15;
        }
        .smart-voice-sub {
          color:var(--muted);
          font-size:14px;
          line-height:1.5;
        }
        .smart-voice-countdown {
          width:72px;
          height:72px;
          margin:6px auto 0;
          border-radius:50%;
          display:grid;
          place-items:center;
          background:color-mix(in srgb, var(--ma-accent) 16%, rgba(255,255,255,.08));
          border:1px solid color-mix(in srgb, var(--ma-accent) 28%, rgba(255,255,255,.12));
          color:var(--ma-accent);
          font-size:28px;
          font-weight:950;
          box-shadow:0 18px 34px rgba(0,0,0,.14);
        }
        .smart-voice-actions {
          grid-template-columns:repeat(3, minmax(0, 1fr));
        }
        .voice-assistant-dialog {
          position:absolute;
          inset:0;
          z-index:86;
          display:none;
          align-items:center;
          justify-content:center;
          padding:20px;
          pointer-events:none;
          background:rgba(2,6,14,.16);
          backdrop-filter:blur(8px) saturate(1.08);
          -webkit-backdrop-filter:blur(8px) saturate(1.08);
        }
        .voice-assistant-dialog.open {
          display:flex;
        }
        .voice-assistant-dialog.keep-screensaver {
          z-index:96;
          background:transparent;
          backdrop-filter:none;
          -webkit-backdrop-filter:none;
        }
        :host(.screensaver-page-open) .voice-assistant-dialog.keep-screensaver {
          position:fixed !important;
          inset:0 !important;
          width:100vw !important;
          height:100dvh !important;
          z-index:2147483202 !important;
          display:flex;
          padding:max(18px, env(safe-area-inset-top)) max(18px, env(safe-area-inset-right)) max(18px, env(safe-area-inset-bottom)) max(18px, env(safe-area-inset-left));
          pointer-events:none;
          background:transparent;
          backdrop-filter:none;
          -webkit-backdrop-filter:none;
        }
        :host(.screensaver-page-open) .voice-assistant-dialog.keep-screensaver .voice-assistant-panel {
          pointer-events:auto;
        }
        .voice-assistant-panel {
          position:relative;
          width:min(560px, calc(100% - 18px));
          display:grid;
          gap:18px;
          padding:22px;
          border-radius:34px;
          overflow:hidden;
          border:1px solid rgba(255,255,255,.18);
          background:
            linear-gradient(145deg, rgba(255,255,255,.16), rgba(255,255,255,.045) 42%, rgba(255,255,255,.08)),
            radial-gradient(circle at 18% 0%, color-mix(in srgb, var(--ma-accent) 22%, transparent), transparent 42%),
            rgba(8,12,22,.78);
          box-shadow:0 34px 92px rgba(0,0,0,.46), inset 0 1px 0 rgba(255,255,255,.16);
          backdrop-filter:blur(30px) saturate(1.18);
          -webkit-backdrop-filter:blur(30px) saturate(1.18);
          pointer-events:auto;
          color:#fff;
          animation:voiceAssistantPanelIn .26s cubic-bezier(.2,.85,.22,1) both;
          transform-origin:center;
        }
        .voice-assistant-dialog.keep-screensaver .voice-assistant-panel {
          width:min(520px, calc(100% - 28px));
          background:
            linear-gradient(145deg, rgba(255,255,255,.13), rgba(255,255,255,.035) 44%, rgba(255,255,255,.065)),
            radial-gradient(circle at 18% 0%, color-mix(in srgb, var(--ma-accent) 18%, transparent), transparent 42%),
            rgba(8,12,22,.66);
          box-shadow:0 26px 72px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.14);
        }
        .voice-assistant-panel::before {
          content:"";
          position:absolute;
          inset:0;
          pointer-events:none;
          background:linear-gradient(120deg, rgba(255,255,255,.18), transparent 28%, transparent 68%, rgba(255,255,255,.08));
          opacity:.42;
        }
        .voice-assistant-panel > * {
          position:relative;
          z-index:1;
        }
        @keyframes voiceAssistantPanelIn {
          from { opacity:0; transform:translateY(18px) scale(.96); filter:blur(8px); }
          to { opacity:1; transform:translateY(0) scale(1); filter:blur(0); }
        }
        .theme-light .voice-assistant-panel {
          background:
            linear-gradient(145deg, rgba(255,255,255,.94), rgba(255,255,255,.74)),
            radial-gradient(circle at 18% 0%, color-mix(in srgb, var(--ma-accent) 18%, transparent), transparent 42%);
          border-color:rgba(105,119,142,.18);
          color:#17202d;
          box-shadow:0 28px 76px rgba(86,103,127,.26), inset 0 1px 0 rgba(255,255,255,.78);
        }
        .theme-light .voice-assistant-brand {
          color:rgba(31,38,51,.42);
        }
        .voice-assistant-head {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
        }
        .voice-assistant-title-row {
          min-width:0;
          display:flex;
          align-items:center;
          gap:12px;
        }
        .voice-assistant-copy {
          min-width:0;
          display:grid;
          gap:3px;
        }
        .voice-assistant-brand {
          width:94px;
          max-width:42vw;
          color:rgba(255,255,255,.58);
          opacity:.9;
          display:block;
          pointer-events:none;
        }
        .voice-assistant-icon {
          width:58px;
          height:58px;
          border-radius:24px;
          display:grid;
          place-items:center;
          color:var(--ma-accent);
          border:1px solid color-mix(in srgb, var(--ma-accent) 28%, rgba(255,255,255,.16));
          background:
            linear-gradient(145deg, rgba(255,255,255,.18), rgba(255,255,255,.055)),
            color-mix(in srgb, var(--ma-accent) 18%, rgba(255,255,255,.08));
          box-shadow:0 18px 38px color-mix(in srgb, var(--ma-accent) 16%, transparent), inset 0 1px 0 rgba(255,255,255,.16);
          transition:transform .2s ease, background-color .2s ease, box-shadow .2s ease;
        }
        .voice-assistant-dialog.status-listening .voice-assistant-icon {
          animation:voiceAssistantIconPulse 1.25s ease-in-out infinite;
        }
        .voice-assistant-dialog.status-success .voice-assistant-icon {
          transform:scale(1.05);
          color:#c9ffdf;
          background:rgba(73,214,127,.18);
          box-shadow:0 16px 32px rgba(73,214,127,.16);
        }
        .voice-assistant-dialog.status-error .voice-assistant-icon {
          color:#ffb7b7;
          background:rgba(255,107,107,.16);
          box-shadow:0 16px 32px rgba(255,107,107,.14);
        }
        @keyframes voiceAssistantIconPulse {
          0%,100% { transform:scale(1); box-shadow:0 18px 38px color-mix(in srgb, var(--ma-accent) 16%, transparent), inset 0 1px 0 rgba(255,255,255,.16); }
          50% { transform:scale(1.06); box-shadow:0 0 0 12px color-mix(in srgb, var(--ma-accent) 10%, transparent), 0 24px 48px color-mix(in srgb, var(--ma-accent) 20%, transparent), inset 0 1px 0 rgba(255,255,255,.18); }
        }
        .voice-assistant-icon .ui-ic { width:25px; height:25px; }
        .voice-assistant-title {
          display:block;
          font-size:22px;
          font-weight:950;
          line-height:1.1;
          letter-spacing:0;
        }
        .voice-assistant-status {
          display:block;
          margin-top:4px;
          color:rgba(255,255,255,.66);
          font-size:12px;
          font-weight:850;
        }
        .theme-light .voice-assistant-status { color:rgba(36,45,58,.64); }
        .voice-assistant-close {
          width:42px;
          height:42px;
          border-radius:16px;
          border:1px solid rgba(255,255,255,.14);
          background:rgba(255,255,255,.08);
          color:inherit;
          display:grid;
          place-items:center;
          cursor:pointer;
        }
        .theme-light .voice-assistant-close {
          background:rgba(255,255,255,.72);
          border-color:rgba(105,119,142,.16);
        }
        .voice-assistant-close .ui-ic { width:19px; height:19px; }
        .voice-assistant-meter {
          height:5px;
          border-radius:999px;
          overflow:hidden;
          background:rgba(255,255,255,.095);
        }
        .voice-assistant-meter span {
          display:block;
          width:42%;
          height:100%;
          border-radius:999px;
          background:linear-gradient(90deg, transparent, var(--ma-accent), transparent);
          animation:voiceAssistantMeter 1.2s ease-in-out infinite;
        }
        .voice-assistant-dialog.status-success .voice-assistant-meter span,
        .voice-assistant-dialog.status-error .voice-assistant-meter span {
          width:100%;
          animation:none;
          background:var(--ma-accent);
        }
        .voice-assistant-dialog.status-error .voice-assistant-meter span {
          background:#ff6b6b;
        }
        @keyframes voiceAssistantMeter {
          0% { transform:translateX(-110%); }
          100% { transform:translateX(260%); }
        }
        .voice-assistant-wave {
          display:flex;
          align-items:center;
          justify-content:center;
          gap:6px;
          width:max-content;
          min-width:118px;
          height:38px;
          margin:0 auto;
          padding:0 16px;
          border-radius:999px;
          background:rgba(255,255,255,.065);
          border:1px solid rgba(255,255,255,.08);
        }
        .voice-assistant-wave span {
          width:5px;
          height:10px;
          border-radius:999px;
          background:color-mix(in srgb, var(--ma-accent) 72%, white 28%);
          opacity:.72;
          transform-origin:center;
          animation:voiceAssistantWave 1s ease-in-out infinite;
        }
        .voice-assistant-wave span:nth-child(2) { animation-delay:.1s; }
        .voice-assistant-wave span:nth-child(3) { animation-delay:.2s; }
        .voice-assistant-wave span:nth-child(4) { animation-delay:.3s; }
        .voice-assistant-wave span:nth-child(5) { animation-delay:.4s; }
        .voice-assistant-dialog.status-processing .voice-assistant-wave span {
          animation-duration:.72s;
        }
        .voice-assistant-dialog.status-success .voice-assistant-wave span,
        .voice-assistant-dialog.status-error .voice-assistant-wave span {
          animation:none;
          height:8px;
          opacity:.36;
        }
        @keyframes voiceAssistantWave {
          0%,100% { transform:scaleY(.62); opacity:.42; }
          50% { transform:scaleY(2.25); opacity:1; }
        }
        .voice-assistant-lines {
          display:grid;
          gap:10px;
        }
        .voice-assistant-line {
          display:grid;
          gap:6px;
          padding:13px 15px;
          border-radius:20px;
          background:rgba(255,255,255,.062);
          border:1px solid rgba(255,255,255,.085);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.045);
        }
        .theme-light .voice-assistant-line {
          background:rgba(255,255,255,.72);
          border-color:rgba(105,119,142,.12);
        }
        .voice-assistant-line-label {
          color:rgba(255,255,255,.56);
          font-size:11px;
          font-weight:950;
          text-transform:uppercase;
        }
        .theme-light .voice-assistant-line-label { color:rgba(36,45,58,.52); }
        .voice-assistant-line-text {
          min-height:22px;
          font-size:15px;
          font-weight:850;
          line-height:1.45;
          overflow-wrap:anywhere;
        }
        .voice-assistant-placeholder {
          color:rgba(255,255,255,.45);
        }
        .theme-light .voice-assistant-placeholder { color:rgba(36,45,58,.42); }
        .voice-assistant-actions {
          display:flex;
          gap:10px;
          justify-content:flex-end;
          flex-wrap:wrap;
        }
        .voice-assistant-actions button {
          min-height:42px;
          padding:0 15px;
          border-radius:14px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.08);
          color:inherit;
          font-weight:900;
          cursor:pointer;
        }
        .voice-assistant-actions button[hidden] {
          display:none !important;
        }
        .voice-assistant-actions .primary {
          color:#17120a;
          border-color:transparent;
          background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
        }
        .menu-sheet {
          width:min(100%, 720px);
          max-height:calc(100% - 8px);
          margin-top:auto;
          position:relative;
          display:grid;
          grid-template-rows:auto minmax(0,1fr);
          overflow:hidden;
          border-radius:30px;
          box-shadow:0 24px 60px rgba(0,0,0,.34);
        }
        .action-grid {
          display:grid;
          grid-template-columns:minmax(0,1fr);
          gap:12px;
          align-content:start;
          width:100%;
        }
        .menu-sheet.sheet-actions,
        .menu-sheet.sheet-simple {
          height:calc(100% - 8px);
          max-height:calc(100% - 8px);
          margin-top:0;
        }
        .menu-sheet.sheet-queue-flow {
          width:min(calc(100% - 34px), 348px);
          height:min(720px, calc(100% - 48px));
          max-height:calc(100% - 48px);
          align-self:center;
          margin:auto;
          border-radius:30px;
          grid-template-rows:minmax(0,1fr);
        }
        .menu-sheet.sheet-queue-flow .menu-head {
          position:absolute;
          inset-block-start:8px;
          inset-inline-end:8px;
          z-index:8;
          display:block;
          padding:0;
          border:0;
          pointer-events:none;
          background:transparent;
        }
        .menu-sheet.sheet-queue-flow .menu-title,
        .menu-sheet.sheet-queue-flow #mobileMenuBackBtn,
        .menu-sheet.sheet-queue-flow #mobileMenuAuxBtn {
          display:none !important;
        }
        .menu-sheet.sheet-queue-flow #mobileMenuCloseBtn {
          pointer-events:auto;
          width:38px;
          height:38px;
          border-radius:999px;
          display:grid;
          place-items:center;
          border:1px solid rgba(255,255,255,.16);
          background:rgba(10,14,22,.46);
          color:#fff;
          font-size:22px;
          line-height:1;
          backdrop-filter:blur(10px);
          -webkit-backdrop-filter:blur(10px);
        }
        .menu-sheet.sheet-media-detail {
          width:min(calc(100% - 20px), 720px);
          height:min(760px, calc(100% - 34px));
          max-height:calc(100% - 34px);
          align-self:center;
          margin:auto;
          border-radius:28px;
        }
        .menu-sheet.sheet-artist-detail {
          width:min(100%, 920px);
          height:calc(100% - 8px);
          max-height:calc(100% - 8px);
          margin-top:0;
        }
        .menu-body.sheet-media-detail {
          padding:14px;
          overflow:hidden;
        }
        .menu-body.sheet-artist-detail {
          padding:14px;
          overflow:auto;
        }
        .menu-sheet.sheet-schedules {
          height:calc(100% - 8px);
          max-height:calc(100% - 8px);
          margin-top:0;
        }
        .menu-body.sheet-actions,
        .menu-body.sheet-simple {
          padding:16px 14px 20px;
        }
        .menu-body.sheet-schedules {
          min-height:0;
          padding:16px 14px 20px;
          overflow:auto;
        }
        .menu-body.sheet-schedules .settings-shell {
          min-height:0;
          height:100%;
          display:grid;
          grid-template-rows:auto minmax(0,1fr);
          align-content:start;
          gap:14px;
        }
        `;
}
