// settings styles. Order is preserved by card-styles.js.
export default function() {
  return `.settings-accordion-summary > svg,
        .settings-accordion-summary .settings-accordion-chevron {
          width: 18px;
          height: 18px;
          flex: 0 0 18px;
          transition: transform 160ms ease;
          opacity: .7;
        }
        .settings-accordion[open] > .settings-accordion-summary > svg,
        .settings-accordion[open] > .settings-accordion-summary .settings-accordion-chevron {
          transform: rotate(90deg);
        }
        .settings-accordion[open] > .settings-accordion-summary {
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          border-bottom: none;
        }
        .settings-accordion > .settings-group {
          margin-top: 0;
          border-top: none;
          border-top-left-radius: 0;
          border-top-right-radius: 0;
        }
        .settings-accordion:not([open]) > .settings-group { display: none; }
        .settings-group {
          display:grid;
          gap:10px;
          padding:16px;
          border-radius:18px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
        }
        .theme-light .settings-group {
          background:rgba(255,255,255,.72);
          border-color:rgba(147,161,183,.2);
        }
        .settings-label {
          font-size:13px;
          font-weight:900;
          letter-spacing:.06em;
          text-transform:uppercase;
          color:rgba(255,255,255,.64);
        }
        .theme-light .settings-label { color:rgba(55,68,85,.64); }
        .settings-pills,.settings-actions { display:flex; flex-wrap:wrap; gap:10px; }
        .schedule-tabs {
          display:grid;
          grid-template-columns:repeat(3, minmax(0, 1fr));
          gap:8px;
          padding:6px;
          border-radius:18px;
          background:rgba(255,255,255,.07);
          border:1px solid rgba(255,255,255,.1);
        }
        .schedule-tabs .settings-pill {
          min-height:44px;
          padding:0 10px;
          border-radius:14px;
        }
        .schedule-list {
          display:grid;
          gap:10px;
        }
        .schedule-row {
          display:grid;
          grid-template-columns:minmax(0,1fr) auto;
          align-items:center;
          gap:10px;
          padding:10px;
          border-radius:18px;
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.1);
        }
        .schedule-row.disabled {
          opacity:.58;
        }
        .schedule-row.editing {
          border-color:color-mix(in srgb, var(--ma-accent) 42%, rgba(255,255,255,.12));
          background:color-mix(in srgb, var(--ma-accent) 12%, rgba(255,255,255,.06));
        }
        .schedule-row-main {
          min-width:0;
          border:none;
          background:transparent;
          color:inherit;
          font:inherit;
          display:grid;
          grid-template-columns:auto minmax(0,1fr);
          align-items:center;
          gap:12px;
          text-align:inherit;
          cursor:pointer;
        }
        .schedule-row-time {
          min-width:58px;
          min-height:42px;
          padding:0 10px;
          border-radius:14px;
          display:grid;
          place-items:center;
          font-size:18px;
          font-weight:950;
          color:var(--ma-accent);
          background:rgba(0,0,0,.16);
          direction:ltr;
        }
        .schedule-row-copy {
          min-width:0;
          display:grid;
          gap:4px;
        }
        .schedule-row-title {
          font-size:14px;
          font-weight:950;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }
        .schedule-row-sub {
          font-size:12px;
          font-weight:800;
          color:rgba(255,255,255,.62);
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }
        .schedule-row-actions {
          display:flex;
          gap:6px;
          align-items:center;
        }
        .schedule-row-actions .settings-pill {
          min-height:38px;
          padding:0 10px;
          border-radius:12px;
        }
        .schedule-row-actions .ui-ic {
          width:16px;
          height:16px;
        }
        .theme-light .schedule-tabs,
        .theme-light .schedule-row {
          background:rgba(255,255,255,.74);
          border-color:rgba(147,161,183,.18);
        }
        .theme-light .schedule-row-time {
          background:rgba(238,243,248,.9);
        }
        .theme-light .schedule-row-sub {
          color:rgba(55,68,85,.62);
        }
        .rtl .settings-pills,
        .rtl .settings-actions,
        .rtl .settings-range {
          direction:rtl;
          justify-content:flex-start;
        }
        .settings-pill {
          min-height:42px;
          padding:0 16px;
          border:none;
          border-radius:14px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
          color:inherit;
          font:inherit;
          font-weight:800;
          cursor:pointer;
        }
        .theme-light .settings-pill {
          background:rgba(255,255,255,.78);
          border-color:rgba(147,161,183,.2);
        }
        .settings-pill.active {
          color:#18120a;
          background:linear-gradient(135deg,#f7bf5c,#f5a623);
          box-shadow:0 10px 18px rgba(224,161,27,.18);
        }
        .settings-color-wrap,.settings-range { display:grid; gap:10px; }
        .night-window-grid {
          display:grid;
          grid-template-columns:repeat(2, minmax(0,1fr));
          gap:12px;
        }
        .scheduled-start-card {
          border-color:color-mix(in srgb, var(--ma-accent) 22%, rgba(255,255,255,.12));
          background:
            radial-gradient(circle at 12% 12%, color-mix(in srgb, var(--ma-accent) 14%, transparent), transparent 34%),
            rgba(255,255,255,.08);
        }
        .scheduled-start-grid {
          display:grid;
          grid-template-columns:minmax(116px, .78fr) minmax(0, 1fr) minmax(0, 1.16fr);
          gap:12px;
          align-items:stretch;
        }
        .scheduled-start-grid.two-col {
          grid-template-columns:repeat(2, minmax(0,1fr));
        }
        .wake-schedule-layout {
          min-height:0;
          height:100%;
          display:grid;
          grid-template-columns:minmax(280px, .9fr) minmax(0, 1.25fr);
          gap:14px;
          align-items:start;
          overflow:auto;
          overscroll-behavior:contain;
          padding:0 2px 8px;
        }
        .wake-schedule-list-card,
        .wake-schedule-editor-card {
          min-height:0;
          align-self:start;
        }
        .wake-schedule-list-card {
          max-height:100%;
          overflow:auto;
        }
        .wake-schedule-editor-card {
          overflow:visible;
        }
        .scheduled-start-field {
          display:grid;
          gap:10px;
          padding:14px;
          border-radius:18px;
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.12);
        }
        .theme-light .scheduled-start-card {
          background:
            radial-gradient(circle at 12% 12%, color-mix(in srgb, var(--ma-accent) 12%, transparent), transparent 34%),
            rgba(255,255,255,.72);
        }
        .theme-light .scheduled-start-field {
          background:rgba(255,255,255,.76);
          border-color:rgba(147,161,183,.2);
        }
        .sleep-timer-action-row {
          display:grid;
          grid-template-columns:repeat(3, minmax(0, 1fr));
          gap:10px;
          width:100%;
        }
        .sleep-timer-action-row.with-cancel {
          grid-template-columns:repeat(4, minmax(0, 1fr));
        }
        .sleep-timer-action-btn {
          min-height:52px;
          border:none;
          border-radius:18px;
          display:grid;
          place-items:center;
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 24%, rgba(255,255,255,.08)), rgba(255,255,255,.07));
          border:1px solid color-mix(in srgb, var(--ma-accent) 22%, rgba(255,255,255,.1));
          color:#fff;
          font:inherit;
          font-size:16px;
          font-weight:950;
          cursor:pointer;
          box-shadow:0 14px 26px rgba(0,0,0,.12);
        }
        .sleep-timer-action-btn.danger {
          color:#ffe1d9;
          background:rgba(255,100,100,.16);
          border-color:rgba(255,122,122,.24);
        }
        .theme-light .sleep-timer-action-btn {
          color:#1f2633;
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 18%, rgba(255,255,255,.88)), rgba(246,249,252,.82));
          border-color:color-mix(in srgb, var(--ma-accent) 18%, rgba(147,161,183,.2));
          box-shadow:0 14px 26px rgba(110,127,153,.12);
        }
        .theme-light .sleep-timer-action-btn.danger {
          color:#8b2935;
          background:rgba(255,236,236,.92);
          border-color:rgba(255,122,122,.18);
        }
        .night-time-card {
          display:grid;
          gap:10px;
          padding:14px;
          border-radius:18px;
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.12);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.04);
        }
        .theme-light .night-time-card {
          background:rgba(255,255,255,.76);
          border-color:rgba(147,161,183,.2);
          box-shadow:0 10px 24px rgba(110,127,153,.08);
        }
        .night-time-label {
          font-size:12px;
          font-weight:900;
          letter-spacing:.04em;
          color:rgba(255,255,255,.62);
        }
        .theme-light .night-time-label {
          color:rgba(55,68,85,.62);
        }
        .night-time-input {
          width:100%;
          min-width:0;
          max-width:100%;
          box-sizing:border-box;
          min-height:64px;
          padding:0 18px;
          border-radius:20px;
          border:1px solid rgba(255,255,255,.14);
          background:rgba(10,14,22,.32);
          color:#f4f7ff;
          font-family:var(--homeii-font-family);
          font-size:26px;
          font-weight:950;
          letter-spacing:.01em;
          outline:none;
          direction:ltr;
          text-align:center;
          appearance:none;
          -webkit-appearance:none;
          box-shadow:0 12px 26px rgba(0,0,0,.12);
          color-scheme:dark;
        }
        .night-time-input:focus {
          border-color:color-mix(in srgb, var(--ma-accent) 42%, rgba(255,255,255,.18));
          box-shadow:0 0 0 4px color-mix(in srgb, var(--ma-accent) 14%, transparent), 0 14px 28px rgba(0,0,0,.14);
        }
        .theme-light .night-time-input {
          background:rgba(255,255,255,.94);
          border-color:rgba(147,161,183,.22);
          color:#1f2633;
          box-shadow:0 12px 26px rgba(111,126,150,.1);
          color-scheme:light;
        }
        .night-time-input::-webkit-calendar-picker-indicator {
          opacity:.82;
          cursor:pointer;
        }
        .theme-light .night-time-input::-webkit-calendar-picker-indicator {
          opacity:.68;
        }
        .settings-select {
          width:100%;
          max-width:none;
        }
        .settings-select-card {
          display:grid;
          grid-template-columns:44px minmax(0,1fr);
          align-items:center;
          gap:10px;
          width:100%;
          padding:8px;
          border-radius:20px;
          border:1px solid rgba(255,255,255,.12);
          background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.045));
          box-shadow:inset 0 1px 0 rgba(255,255,255,.08), 0 14px 28px rgba(0,0,0,.12);
        }
        .settings-select-card-icon {
          width:44px;
          height:44px;
          border-radius:15px;
          display:grid;
          place-items:center;
          color:var(--ma-accent);
          background:color-mix(in srgb, var(--ma-accent) 16%, rgba(255,255,255,.08));
          border:1px solid color-mix(in srgb, var(--ma-accent) 20%, rgba(255,255,255,.1));
          flex-shrink:0;
        }
        .settings-select-card-icon .ui-ic {
          width:21px;
          height:21px;
        }
        .settings-select-card .settings-select {
          min-height:44px;
          border-radius:14px;
          background:rgba(7,9,13,.28);
        }
        .theme-light .settings-select-card {
          background:rgba(255,255,255,.68);
          border-color:rgba(147,161,183,.18);
          box-shadow:0 14px 28px rgba(110,127,153,.12);
        }
        .theme-light .settings-select-card .settings-select {
          background:rgba(255,255,255,.72);
        }
        .settings-hint {
          color:rgba(255,255,255,.58);
          font-size:12px;
          line-height:1.45;
          margin-top:2px;
        }
        .theme-light .settings-hint {
          color:rgba(55,68,85,.62);
        }
        .card.layout-mobile .controls .minor-btn,
        .card.layout-mobile .controls .side-btn,
        .card.layout-mobile .controls .play-btn,
        .card.layout-mobile .controls .volume-btn {
          border-radius:999px !important;
        }
        .card.layout-mobile .controls .volume-btn.is-muted,
        .card.layout-mobile .player-mini-mute.is-muted {
          background:rgba(160,42,48,.22) !important;
          border-color:rgba(160,42,48,.28) !important;
          color:#fff !important;
          box-shadow:0 12px 22px rgba(110,18,28,.16), inset 0 1px 0 rgba(255,255,255,.08);
        }
        .player-focus-meta,
        .player-focus-sub,
        .active-players-bubble {
          display:none !important;
        }
        .card.layout-tablet .queue-list {
          width:min(100%, 680px);
          gap:12px;
        }
        .card.layout-tablet .queue-row {
          min-height:68px;
          padding:10px 12px;
          border-radius:20px;
        }
        .card.layout-tablet .players-premium-grid {
          gap:18px;
        }
        .settings-version {
          margin-top:10px;
          text-align:center;
          font-size:12px;
          font-weight:800;
          letter-spacing:.08em;
          color:rgba(255,255,255,.46);
        }
        .theme-light .settings-version {
          color:rgba(33,41,57,.42);
        }
        .settings-text-input,
        .announcement-textarea {
          width:100%;
          min-width:0;
          border:1px solid rgba(255,255,255,.12);
          border-radius:16px;
          background:rgba(255,255,255,.08);
          color:inherit;
          font:inherit;
          font-weight:800;
          padding:12px 14px;
          outline:none;
        }
        .ambient-map-input {
          min-height:76px;
          line-height:1.45;
          resize:vertical;
        }
        .settings-text-input:focus,
        .announcement-textarea:focus {
          border-color:color-mix(in srgb, var(--ma-accent) 44%, transparent);
          box-shadow:0 0 0 4px color-mix(in srgb, var(--ma-accent) 12%, transparent);
        }
        .theme-light .settings-text-input,
        .theme-light .announcement-textarea {
          background:rgba(255,255,255,.74);
          border-color:rgba(147,161,183,.22);
          color:#1f2633;
        }
        @media (max-width: 760px) {
          .menu-body.sheet-schedules .settings-shell {
            height:auto;
            min-height:100%;
            grid-template-rows:auto auto;
          }
          .scheduled-start-grid {
            grid-template-columns:minmax(0,1fr);
          }
          .menu-body.sheet-schedules .scheduled-start-field,
          .menu-body.sheet-schedules .night-time-card {
            min-width:0;
            max-width:100%;
            overflow:hidden;
          }
          .menu-body.sheet-schedules .settings-actions {
            grid-template-columns:minmax(0,1fr);
          }
          .menu-body.sheet-schedules .settings-pill {
            min-width:0;
            max-width:100%;
            white-space:normal;
            overflow-wrap:anywhere;
          }
          .wake-schedule-layout {
            height:auto;
            grid-template-columns:minmax(0,1fr);
            overflow:visible;
          }
          .wake-schedule-list-card {
            max-height:none;
            overflow:visible;
          }
          .night-window-grid {
            grid-template-columns:minmax(0,1fr);
          }
          .night-time-input {
            min-height:58px;
            font-size:22px;
            padding-inline:12px;
          }
        }
        .announcements-shell {
          display:grid;
          gap:14px;
        }
        .announcement-target {
          min-height:68px;
          display:grid;
          grid-template-columns:54px minmax(0,1fr);
          align-items:center;
          gap:12px;
          padding:8px 12px;
          border-radius:22px;
          border:1px solid color-mix(in srgb, var(--ma-accent) 24%, transparent);
          background:color-mix(in srgb, var(--ma-accent) 12%, transparent);
          font-size:17px;
          font-weight:950;
        }
        .announcement-target-icon {
          width:46px;
          height:46px;
          border-radius:17px;
          display:grid;
          place-items:center;
          color:#18120a;
          background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
          box-shadow:0 14px 24px color-mix(in srgb, var(--ma-accent) 20%, transparent);
        }
        .announcement-target-icon .ui-ic {
          width:22px;
          height:22px;
        }
        .announcement-target-select {
          width:100%;
          min-width:0;
          min-height:48px;
          border:none;
          background:transparent;
          box-shadow:none;
          padding:0;
          font:inherit;
          color:inherit;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .theme-dark .announcement-target {
          background:rgba(20,24,32,.74);
          border-color:rgba(255,255,255,.12);
        }
        .theme-dark .announcement-target-select {
          background:rgba(15,18,28,.82);
          color:#f4f6fb;
          border-radius:14px;
          padding:10px 12px;
          border:1px solid rgba(255,255,255,.12);
          color-scheme:dark;
        }
        .theme-dark #mobileAnnouncementTargetSelect option,
        .theme-dark #mobileAnnouncementTtsLanguageSelect option {
          background:#171d28;
          color:#f4f6fb;
        }
        .announcement-input-wrap {
          position:relative;
          display:grid;
        }
        .announcement-textarea {
          resize:vertical;
          min-height:124px;
          line-height:1.5;
          padding-inline-end:64px;
        }
        .announcement-voice-btn {
          position:absolute;
          inset-block-start:10px;
          inset-inline-end:10px;
          width:44px;
          height:44px;
          border:none;
          border-radius:16px;
          display:grid;
          place-items:center;
          color:#18120a;
          background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
          box-shadow:0 12px 22px color-mix(in srgb, var(--ma-accent) 18%, transparent);
          cursor:pointer;
        }
        .announcement-voice-btn .ui-ic { width:20px; height:20px; }
        .announcement-presets {
          display:flex;
          flex-wrap:wrap;
          gap:10px;
        }
        .surprise-popup {
          position:absolute;
          inset-inline:0;
          inset-block-end:calc(116px + env(safe-area-inset-bottom));
          display:none;
          justify-content:center;
          pointer-events:none;
          z-index:88;
        }
        .surprise-popup.open {
          display:flex;
          animation:toastIn .22s ease;
        }
        .surprise-popup-card {
          width:min(244px, calc(100% - 28px));
          display:grid;
          gap:10px;
          justify-items:center;
          padding:14px;
          border-radius:24px;
          border:1px solid rgba(255,255,255,.14);
          background:rgba(15,18,28,.88);
          backdrop-filter:blur(22px);
          -webkit-backdrop-filter:blur(22px);
          box-shadow:0 22px 48px rgba(0,0,0,.24);
        }
        .surprise-popup-player {
          font-size:13px;
          font-weight:900;
          color:rgba(255,255,255,.78);
          text-align:center;
        }
        .surprise-popup-art {
          width:118px;
          height:118px;
          border-radius:24px;
          overflow:hidden;
          display:grid;
          place-items:center;
          background:linear-gradient(145deg, rgba(255,255,255,.12), rgba(255,255,255,.04));
          border:1px solid rgba(255,255,255,.14);
          color:var(--ma-accent);
        }
        .surprise-popup-art img { width:100%; height:100%; object-fit:cover; display:block; }
        .surprise-popup-art .ui-ic { width:34px; height:34px; }
        .surprise-popup-title {
          font-size:18px;
          font-weight:950;
          line-height:1.15;
          text-align:center;
          color:#fff;
        }
        .theme-light .surprise-popup-card {
          background:rgba(255,255,255,.92);
          border-color:rgba(147,161,183,.2);
          box-shadow:0 18px 34px rgba(110,127,153,.16);
        }
        .theme-light .surprise-popup-player { color:#5f6c80; }
        .theme-light .surprise-popup-title { color:#16202d; }
        .theme-light .surprise-popup-art {
          background:linear-gradient(145deg, rgba(255,255,255,.96), rgba(244,247,251,.88));
          border-color:rgba(147,161,183,.18);
        }
        .announcement-send-btn {
          min-height:62px;
          display:flex !important;
          flex-direction:row !important;
          align-items:center;
          justify-content:center;
          gap:12px;
          font-size:17px;
        }
        .announcement-send-btn .ui-ic { width:24px; height:24px; flex:none; }
        .settings-stat-row {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          font-size:14px;
          font-weight:800;
        }
        .settings-color-row {
          display:grid;
          grid-template-columns:54px minmax(0,1fr);
          gap:12px;
          align-items:center;
        }
        .rtl .settings-color-row {
          direction:rtl;
        }
        .settings-check-grid {
          display:grid;
          gap:10px;
          grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));
        }
        .settings-check-pill {
          min-height:44px;
          display:flex;
          align-items:center;
          gap:10px;
          padding:0 14px;
          border-radius:14px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
          font-weight:800;
        }
        .theme-light .settings-check-pill {
          background:rgba(255,255,255,.78);
          border-color:rgba(147,161,183,.2);
        }
        .settings-check-pill input {
          width:18px;
          height:18px;
          margin:0;
          accent-color:var(--ma-accent);
        }
        .settings-check-pill.is-locked {
          cursor:default;
          opacity:.94;
        }
        .settings-check-pill.is-locked input {
          opacity:.78;
        }
        .settings-check-pill.quick-action-pill.danger {
          border-color:rgba(255,105,115,.24);
          background:linear-gradient(145deg, rgba(255,85,95,.1), rgba(255,255,255,.07));
        }
        .quick-action-setting-icon {
          display:inline-grid;
          place-items:center;
          width:24px;
          height:24px;
          flex:0 0 24px;
        }
        .quick-action-setting-icon .ui-ic {
          width:19px;
          height:19px;
        }
        .quick-action-pill {
          justify-content:flex-start;
          min-width:0;
        }
        .quick-action-pill-label {
          min-width:0;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }
        .quick-action-order-controls {
          margin-inline-start:auto;
          display:flex;
          gap:4px;
        }
        .quick-action-order-btn {
          width:28px;
          height:28px;
          display:grid;
          place-items:center;
          border:0;
          border-radius:999px;
          background:rgba(255,255,255,.1);
          color:inherit;
          padding:0;
          cursor:pointer;
        }
        .quick-action-order-btn[disabled] {
          opacity:.35;
          cursor:default;
        }
        .quick-action-order-btn .ui-ic {
          width:16px;
          height:16px;
        }
        .settings-check-pill.quick-action-pill.danger .quick-action-setting-icon {
          color:#ffb6b6;
        }
        .theme-light .settings-check-pill.quick-action-pill.danger {
          background:#fff1f2;
          border-color:rgba(180,35,43,.18);
        }
        .theme-light .settings-check-pill.quick-action-pill.danger .quick-action-setting-icon {
          color:#b4232b;
        }
        .settings-fixed-badge {
          margin-inline-start:auto;
          padding:3px 8px;
          border-radius:999px;
          background:rgba(245,166,35,.16);
          color:var(--ma-accent);
          font-size:11px;
          font-weight:900;
          letter-spacing:0;
        }
        .rtl .settings-fixed-badge {
          margin-inline-start:0;
          margin-inline-end:auto;
        }
        .rtl .settings-check-pill {
          direction:rtl;
          justify-content:flex-start;
          text-align:right;
        }
        .rtl .settings-select {
          direction:rtl;
          text-align:right;
        }
        .settings-color-picker {
          width:54px;
          height:54px;
          padding:0;
          border:none;
          border-radius:50%;
          overflow:hidden;
          background:none;
          cursor:pointer;
        }
        .settings-range input {
          width:100%;
          accent-color:var(--ma-accent);
        }
        .settings-value {
          font-size:14px;
          font-weight:800;
        }
        .active-players-bubble {
          position:absolute;
          inset-inline-start:12px;
          inset-block-start:14px;
          z-index:4;
          display:none;
          align-items:center;
          justify-content:center;
          min-height:34px;
          width:36px;
          height:36px;
          padding:0;
          border:none;
          border-radius:999px;
          color:var(--ma-accent);
          background:rgba(14,18,28,.46);
          border:1px solid rgba(255,255,255,.12);
          backdrop-filter:blur(16px);
          -webkit-backdrop-filter:blur(16px);
          box-shadow:0 12px 28px rgba(0,0,0,.18);
          cursor:pointer;
        }
        .active-players-bubble.open { display:inline-flex; }
        .active-players-bubble .eq-icon,
        .active-players-bubble .ui-ic { display:none !important; }
        .active-players-bubble #activePlayersCount {
          font-size:14px;
          font-weight:900;
          line-height:1;
          color:inherit !important;
        }
        .theme-light .active-players-bubble {
          color:var(--ma-accent);
          background:rgba(255,255,255,.74);
          border-color:rgba(147,161,183,.2);
          box-shadow:0 12px 28px rgba(111,126,150,.16);
        }
        .theme-light .active-players-bubble #activePlayersCount {
          color:var(--ma-accent);
        }
        .toast-wrap { position:absolute; inset-inline:16px; bottom:max(16px, env(safe-area-inset-bottom)); z-index:40; display:grid; gap:8px; pointer-events:none; }
        .toast-wrap.top-toast {
          top:max(16px, env(safe-area-inset-top));
          bottom:auto;
          justify-items:center;
          align-content:start;
          z-index:72;
        }
        .toast-wrap.studio-toast {
          top:max(16px, env(safe-area-inset-top));
          bottom:auto;
          justify-items:center;
          align-content:start;
          z-index:72;
        }
        .toast-wrap.studio-toast .toast {
          width:min(520px, calc(100% - 24px));
          justify-self:center;
        }
        .toast {
          min-height:48px;
          padding:12px 14px;
          border-radius:16px;
          color:#fff;
          background:rgba(17,19,28,.9);
          border:1px solid rgba(255,255,255,.12);
          backdrop-filter:blur(14px);
          -webkit-backdrop-filter:blur(14px);
          display:flex;
          align-items:center;
          gap:10px;
          pointer-events:auto;
          box-shadow:0 16px 34px rgba(0,0,0,.22);
          animation:toastIn .18s ease-out;
        }
        `;
}
