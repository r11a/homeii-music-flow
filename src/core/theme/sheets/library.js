// library styles. Order is preserved by card-styles.js.
export default function() {
  return `.media-entry.library-action-feedback,
        .media-category-row.library-action-feedback,
        .radio-country-entry.library-action-feedback,
        .media-detail-hero.library-action-feedback {
          transform:translateY(-2px) scale(.988);
          border-color:color-mix(in srgb, var(--ma-accent) 36%, transparent);
          box-shadow:0 14px 32px color-mix(in srgb, var(--ma-accent) 18%, transparent), inset 0 1px 0 rgba(255,255,255,.12);
          filter:saturate(1.04);
        }
        .library-nav-btn.library-action-feedback,
        .media-layout-btn.library-action-feedback,
        .media-detail-action-btn.library-action-feedback,
        .media-detail-play-btn.library-action-feedback,
        .media-detail-nav-btn.library-action-feedback,
        .artist-hero-icon-btn.library-action-feedback,
        .radio-stage-fab.library-action-feedback,
        .library-tab-search-submit.library-action-feedback,
        .library-tab-search-clear.library-action-feedback,
        .library-player-focus.library-action-feedback {
          transform:translateY(-2px) scale(.96);
          box-shadow:0 12px 24px color-mix(in srgb, var(--ma-accent) 22%, transparent);
          color:color-mix(in srgb, var(--ma-accent) 72%, white 28%);
        }
        .media-entry.library-action-loading,
        .media-category-row.library-action-loading,
        .radio-country-entry.library-action-loading,
        .media-detail-hero.library-action-loading,
        .library-nav-btn.library-action-loading,
        .media-layout-btn.library-action-loading,
        .media-detail-action-btn.library-action-loading,
        .media-detail-play-btn.library-action-loading,
        .media-detail-nav-btn.library-action-loading,
        .artist-hero-icon-btn.library-action-loading,
        .radio-stage-fab.library-action-loading,
        .library-tab-search-submit.library-action-loading,
        .library-player-focus.library-action-loading {
          isolation:isolate;
        }
        .media-entry.library-action-loading::after,
        .media-category-row.library-action-loading::after,
        .radio-country-entry.library-action-loading::after,
        .media-detail-hero.library-action-loading::after,
        .library-nav-btn.library-action-loading::after,
        .media-layout-btn.library-action-loading::after,
        .media-detail-action-btn.library-action-loading::after,
        .media-detail-play-btn.library-action-loading::after,
        .media-detail-nav-btn.library-action-loading::after,
        .artist-hero-icon-btn.library-action-loading::after,
        .radio-stage-fab.library-action-loading::after,
        .library-tab-search-submit.library-action-loading::after,
        .library-player-focus.library-action-loading::after {
          content:"";
          position:absolute;
          width:18px;
          height:18px;
          border-radius:999px;
          border:2px solid rgba(255,255,255,.28);
          border-inline-end-color:color-mix(in srgb, var(--ma-accent) 88%, white 12%);
          pointer-events:none;
          z-index:6;
          animation:homeiiLoadingSpin .74s linear infinite;
          box-shadow:0 0 18px color-mix(in srgb, var(--ma-accent) 22%, transparent);
        }
        .media-entry.list.library-action-loading::after,
        .media-category-row.library-action-loading::after,
        .radio-country-entry.library-action-loading::after,
        .media-detail-hero.library-action-loading::after {
          inset-inline-end:14px;
          inset-block-start:50%;
          margin-block-start:-9px;
        }
        .media-entry.grid.library-action-loading::after {
          inset-inline-end:12px;
          inset-block-end:12px;
        }
        .library-nav-btn.library-action-loading::after,
        .media-layout-btn.library-action-loading::after,
        .media-detail-action-btn.library-action-loading::after,
        .media-detail-play-btn.library-action-loading::after,
        .media-detail-nav-btn.library-action-loading::after,
        .artist-hero-icon-btn.library-action-loading::after,
        .radio-stage-fab.library-action-loading::after,
        .library-tab-search-submit.library-action-loading::after,
        .library-player-focus.library-action-loading::after {
          width:14px;
          height:14px;
          inset-inline-end:5px;
          inset-block-start:5px;
          border-width:2px;
        }
        .theme-light .media-entry.library-action-loading::after,
        .theme-light .media-category-row.library-action-loading::after,
        .theme-light .radio-country-entry.library-action-loading::after,
        .theme-light .media-detail-hero.library-action-loading::after,
        .theme-light .library-nav-btn.library-action-loading::after,
        .theme-light .media-layout-btn.library-action-loading::after,
        .theme-light .media-detail-action-btn.library-action-loading::after,
        .theme-light .media-detail-play-btn.library-action-loading::after,
        .theme-light .media-detail-nav-btn.library-action-loading::after,
        .theme-light .artist-hero-icon-btn.library-action-loading::after,
        .theme-light .radio-stage-fab.library-action-loading::after,
        .theme-light .library-tab-search-submit.library-action-loading::after,
        .theme-light .library-player-focus.library-action-loading::after {
          border-color:rgba(30,41,59,.24);
          border-inline-end-color:var(--ma-accent);
        }
        @media (prefers-reduced-motion: reduce) {
          .media-entry.library-action-loading::after,
          .media-category-row.library-action-loading::after,
          .radio-country-entry.library-action-loading::after,
          .media-detail-hero.library-action-loading::after,
          .library-nav-btn.library-action-loading::after,
          .media-layout-btn.library-action-loading::after,
          .media-detail-action-btn.library-action-loading::after,
          .media-detail-play-btn.library-action-loading::after,
          .media-detail-nav-btn.library-action-loading::after,
          .artist-hero-icon-btn.library-action-loading::after,
          .radio-stage-fab.library-action-loading::after,
          .library-tab-search-submit.library-action-loading::after,
          .library-player-focus.library-action-loading::after {
            animation:none;
          }
        }
        .theme-dark .menu-sheet,
        .theme-dark .notice,
        .theme-dark .menu-item,
        .theme-dark .menu-list-item,
        .theme-dark .queue-row,
        .theme-dark .media-search-shell,
        .theme-dark .media-category-row {
          background:linear-gradient(180deg, rgba(44,46,52,.58), rgba(24,26,31,.50));
          border-color:rgba(255,255,255,.12);
          color:#f4f6fb;
          backdrop-filter:blur(22px);
          -webkit-backdrop-filter:blur(22px);
        }
        .theme-dark .media-sort-select,
        .theme-dark .settings-select,
        .theme-dark .settings-text-input,
        .theme-dark .announcement-textarea {
          background:linear-gradient(180deg, rgba(34,36,42,.62), rgba(16,18,22,.58));
          color:#f4f6fb;
          border-color:rgba(255,255,255,.12);
          color-scheme:dark;
        }
        .theme-dark .media-sort-select option,
        .theme-dark .settings-select option {
          background:#1a1d22;
          color:#f4f6fb;
        }
        .theme-dark .menu-item-sub,
        .theme-dark .queue-sub,
        .theme-dark .settings-hint {
          color:rgba(236,241,248,.68);
        }
        .theme-dark .menu-backdrop,
        .theme-dark .queue-action-backdrop {
          background:rgba(4,5,8,.34);
          backdrop-filter:blur(24px);
          -webkit-backdrop-filter:blur(24px);
        }
        .theme-dark .queue-action-sheet,
        .theme-dark .lyrics-sheet,
        .theme-dark .player-menu-card,
        .theme-dark .group-player-card,
        .theme-dark .settings-group,
        .theme-dark .announcement-target,
        .theme-dark .surprise-popup-card,
        .theme-dark .player-focus {
          background:linear-gradient(180deg, rgba(46,48,54,.62), rgba(24,26,31,.52));
          border-color:rgba(255,255,255,.12);
          box-shadow:0 22px 48px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.08);
          backdrop-filter:blur(22px);
          -webkit-backdrop-filter:blur(22px);
        }
        .theme-dark .announcement-target-select,
        .theme-dark #mobileAnnouncementTargetSelect {
          background:linear-gradient(180deg, rgba(36,38,44,.68), rgba(18,20,24,.58));
          border-color:rgba(255,255,255,.12);
          color:#f4f6fb;
        }
        .theme-dark #mobileAnnouncementTargetSelect option {
          background:#1a1d22;
          color:#f4f6fb;
        }
        .theme-dark .settings-pill,
        .theme-dark .settings-check-pill,
        .theme-dark .empty-quick-card {
          background:linear-gradient(180deg, rgba(50,52,58,.54), rgba(24,26,31,.44));
          border-color:rgba(255,255,255,.12);
          box-shadow:0 16px 34px rgba(0,0,0,.18);
        }
        .theme-dark .empty-quick-kicker {
          color:rgba(236,241,248,.56);
        }
        .theme-light .empty-quick-card {
          background:linear-gradient(145deg, rgba(255,255,255,.88), rgba(242,246,251,.76));
          border-color:rgba(147,161,183,.18);
          box-shadow:0 16px 30px rgba(111,126,150,.14);
        }
        .theme-light .empty-quick-kicker {
          color:#7f8a9b;
        }
        .theme-light .empty-quick-title {
          color:#1f2633;
        }
        .theme-light .surprise-me-card.magic-empty {
          background:
            radial-gradient(circle at 50% 24%, rgba(31,38,51,.08), transparent 30%),
            radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--ma-accent) 28%, rgba(31,38,51,.06)), transparent 34%),
            linear-gradient(180deg, rgba(255,255,255,.82), rgba(240,244,250,.66));
          border-color:rgba(147,161,183,.18);
          box-shadow:0 18px 36px rgba(111,126,150,.14), inset 0 1px 0 rgba(255,255,255,.46);
        }
        .theme-light .surprise-me-wand {
          color:#1f2633;
        }
        .theme-light .surprise-me-wand .ui-ic {
          filter:drop-shadow(0 0 12px rgba(31,38,51,.10));
        }
        .theme-light .surprise-me-card.magic-empty:active,
        .theme-light .surprise-me-card.magic-empty.pressed {
          box-shadow:0 14px 28px rgba(111,126,150,.12), 0 0 0 1px rgba(31,38,51,.10), 0 0 18px rgba(31,38,51,.08);
        }
        .theme-light .empty-voice-btn {
          color:#7a5210;
          background:linear-gradient(180deg, rgba(255,255,255,.88), rgba(239,244,250,.68));
          border-color:color-mix(in srgb, var(--ma-accent) 30%, rgba(147,161,183,.2));
          box-shadow:0 14px 28px rgba(111,126,150,.14), 0 0 0 5px rgba(255,255,255,.45), inset 0 1px 0 rgba(255,255,255,.78);
        }
        .theme-light .empty-voice-btn:hover,
        .theme-light .empty-voice-btn.listening {
          color:#6e4b10;
          background:linear-gradient(180deg, color-mix(in srgb, var(--ma-accent) 16%, white 84%), rgba(255,255,255,.8));
          box-shadow:0 16px 32px color-mix(in srgb, var(--ma-accent) 14%, rgba(111,126,150,.14)), 0 0 0 7px color-mix(in srgb, var(--ma-accent) 8%, transparent), inset 0 1px 0 rgba(255,255,255,.82);
        }
        .theme-light .menu-item.active,
        .theme-light .menu-list-item.active,
        .theme-light .queue-row.active {
          background:color-mix(in srgb, var(--ma-accent) 14%, transparent);
          border-color:color-mix(in srgb, var(--ma-accent) 30%, transparent);
        }
        .media-search-shell,.media-category-row {
          border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.08);
        }
        .theme-light .media-search-shell,
        .theme-light .media-category-row {
          background:rgba(255,255,255,.62);
          border-color:rgba(147,161,183,.2);
          color:#1f2633;
        }
        .media-home-shell { display:grid; gap:14px; align-content:start; }
        .library-shell {
          position:relative;
          display:grid;
          grid-template-rows:auto minmax(0,1fr) auto;
          gap:14px;
          min-height:100%;
          height:100%;
        }
        .library-player-focus {
          display:grid;
          grid-template-columns:44px minmax(0,1fr) auto auto;
          align-items:center;
          justify-content:stretch;
          gap:10px;
          width:100%;
          min-height:62px;
          padding:10px 14px;
          border:none;
          border-radius:20px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
          color:inherit;
          font:inherit;
          text-align:start;
          cursor:pointer;
        }
        .library-player-art {
          width:44px;
          height:44px;
          border-radius:15px;
          display:grid;
          place-items:center;
          overflow:hidden;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
        }
        .library-player-art img {
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        }
        .library-player-art .ui-ic {
          width:20px;
          height:20px;
          opacity:.72;
        }
        .library-player-copy {
          min-width:0;
          display:grid;
          gap:3px;
        }
        .library-player-name {
          font-size:15px;
          font-weight:750;
          overflow:hidden;
          white-space:nowrap;
          text-overflow:ellipsis;
        }
        .library-player-state {
          width:max-content;
          max-width:100%;
          padding:3px 9px;
          border-radius:999px;
          font-size:11px;
          font-weight:850;
          color:#58d68d;
          background:rgba(54,183,113,.14);
          border:1px solid rgba(88,214,141,.25);
        }
        .library-player-focus.is-playing .library-player-state {
          color:#ff6f6f;
          background:rgba(221,62,62,.16);
          border-color:rgba(255,111,111,.28);
        }
        .theme-light .library-player-focus {
          background:rgba(255,255,255,.72);
          border-color:rgba(147,161,183,.2);
        }
        .theme-light .library-player-art {
          background:rgba(255,255,255,.9);
          border-color:rgba(147,161,183,.2);
        }
        .theme-light .library-player-name { color:#172033; }
        .theme-light .library-player-state {
          color:#138a54;
          background:rgba(46,178,112,.13);
          border-color:rgba(34,154,96,.22);
        }
        .theme-light .library-player-focus.is-playing .library-player-state {
          color:#c83e43;
          background:rgba(216,72,78,.13);
          border-color:rgba(196,59,65,.22);
        }
        .library-player-focus .eq-icon {
          display:inline-flex;
          color:rgba(255,255,255,.42);
        }
        .library-player-focus:not(.is-playing) .eq-icon span {
          animation:none;
          height:5px;
          background:currentColor;
        }
        .library-player-focus.is-playing .eq-icon {
          color:var(--ma-accent);
        }
        .theme-light .library-player-focus .eq-icon {
          color:rgba(23,32,51,.34);
        }
        .theme-light .library-player-focus.is-playing .eq-icon {
          color:var(--ma-accent);
        }
        .library-body {
          display:grid;
          gap:14px;
          align-content:start;
          min-height:0;
          overflow:auto;
          padding-inline-end:2px;
        }
        .card.layout-tablet .library-body {
          gap:14px;
        }
        .library-nav {
          display:grid;
          grid-template-columns:repeat(7, minmax(0, 1fr));
          gap:8px;
          padding:8px;
          border-radius:22px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          position:sticky;
          bottom:0;
          align-self:end;
          z-index:5;
        }
        .rtl .library-nav {
          direction:rtl;
        }
        .rtl .library-nav-btn {
          direction:ltr;
        }
        .card.layout-tablet .library-nav {
          gap:6px;
          padding:6px;
          border-radius:16px;
        }
        .theme-light .library-nav {
          background:rgba(255,255,255,.72);
          border-color:rgba(147,161,183,.2);
        }
        .library-nav-btn {
          min-height:56px;
          border:none;
          border-radius:18px;
          display:grid;
          place-items:center;
          background:transparent;
          color:inherit;
          cursor:pointer;
          transition:transform .16s ease, background-color .16s ease, box-shadow .16s ease, color .16s ease;
        }
        .card.layout-tablet .library-nav-btn {
          min-height:46px;
          border-radius:16px;
        }
        .library-nav-btn.tap-feedback {
          transform:translateY(-2px) scale(.96);
          box-shadow:0 12px 22px color-mix(in srgb, var(--ma-accent) 22%, transparent);
        }
        .library-nav-btn .ui-ic { width:22px; height:22px; }
        .library-nav-btn.active {
          color:#18120a;
          background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
          box-shadow:0 10px 18px color-mix(in srgb, var(--ma-accent) 18%, transparent);
        }
        .media-search-zone {
          position:sticky;
          top:-2px;
          z-index:8;
          padding:2px 0 10px;
          background:linear-gradient(180deg, rgba(12,15,22,.96), rgba(12,15,22,.78) 72%, rgba(12,15,22,0));
        }
        .theme-light .media-search-zone {
          background:linear-gradient(180deg, rgba(247,250,253,.98), rgba(247,250,253,.82) 72%, rgba(247,250,253,0));
        }
        .media-search-shell {
          display:grid;
          grid-template-columns:20px minmax(0,1fr) 38px 20px;
          padding:12px 14px;
          gap:10px;
          align-items:center;
          position:relative;
          z-index:1;
        }
        .media-search-shell input {
          border:none;
          background:transparent;
          color:#fff;
          font:inherit;
          outline:none;
          min-width:0;
          width:100%;
          text-align:start;
          direction:auto;
        }
        .theme-light .media-search-shell input { color:#1f2633; }
        .media-search-shell input::placeholder { color:rgba(255,255,255,.52); }
        .theme-light .media-search-shell input::placeholder { color:rgba(55,68,85,.52); }
        .media-search-clear {
          border:none;
          background:transparent;
          color:rgba(255,255,255,.72);
          width:34px;
          height:34px;
          border-radius:12px;
          display:grid;
          place-items:center;
          font-size:22px;
          font-weight:950;
          line-height:1;
          cursor:pointer;
          transition:transform .16s ease, background-color .16s ease, color .16s ease, box-shadow .16s ease;
        }
        .theme-light .media-search-clear:not(.visible) { color:rgba(31,38,51,.68); }
        .media-search-clear.visible {
          color:#fff;
          background:linear-gradient(135deg, rgba(225,63,63,.98), rgba(180,36,36,.92));
          box-shadow:0 12px 22px rgba(197,48,48,.22);
        }
        .media-search-clear.visible:active {
          transform:scale(.92);
        }
        .media-voice-btn {
          width:38px;
          height:38px;
          border:none;
          border-radius:14px;
          display:grid;
          place-items:center;
          color:#18120a;
          background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
          box-shadow:0 10px 20px color-mix(in srgb, var(--ma-accent) 18%, transparent);
          cursor:pointer;
          transition:transform .16s ease, box-shadow .16s ease, opacity .16s ease;
        }
        .media-voice-btn .ui-ic { width:19px; height:19px; }
        .media-voice-btn:active { transform:scale(.94); }
        .media-voice-btn.unsupported { opacity:.52; filter:saturate(.55); }
        .media-voice-btn.listening {
          animation:voicePulse 1s ease-in-out infinite;
          box-shadow:0 0 0 8px color-mix(in srgb, var(--ma-accent) 14%, transparent), 0 14px 26px color-mix(in srgb, var(--ma-accent) 22%, transparent);
        }
        .theme-light .media-search-clear:not(.visible) { color:rgba(55,68,85,.76); }
        @keyframes voicePulse {
          0%,100% { transform:scale(1); }
          50% { transform:scale(1.07); }
        }
        .media-categories {
          display:grid;
          gap:10px;
        }
        .media-home-content {
          display:grid;
          gap:14px;
          align-content:start;
        }
        .media-category-row {
          border:none;
          cursor:pointer;
          justify-content:flex-start;
        }
        .media-category-ico .ui-ic { width:46%; height:46%; }
        .media-results {
          display:grid;
          gap:18px;
        }
        .media-toolbar {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          margin:2px 0 8px;
        }
        .media-toolbar-left,
        .media-toolbar-right {
          display:flex;
          align-items:center;
          gap:10px;
          min-width:0;
        }
        .library-toolbar-actions {
          display:flex;
          align-items:center;
          gap:8px;
        }
        .media-sort-select {
          min-height:42px;
          min-width:112px;
          padding:0 14px;
          border-radius:16px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.08);
          color:inherit;
          font:inherit;
          font-size:13px;
          font-weight:800;
          outline:none;
        }
        .theme-light .media-sort-select {
          background:rgba(255,255,255,.68);
          border-color:rgba(147,161,183,.2);
          color:#1f2633;
        }
        .media-layout-toggle {
          display:inline-flex;
          align-items:center;
          gap:6px;
          padding:6px;
          border-radius:18px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
          backdrop-filter:blur(16px);
          -webkit-backdrop-filter:blur(16px);
        }
        .theme-light .media-layout-toggle {
          background:rgba(255,255,255,.68);
          border-color:rgba(147,161,183,.2);
        }
        .media-layout-btn {
          min-width:40px;
          min-height:38px;
          padding:8px 10px;
          border:none;
          border-radius:14px;
          background:transparent;
          color:inherit;
          font:inherit;
          font-size:0;
          font-weight:800;
          cursor:pointer;
          display:grid;
          place-items:center;
        }
        .media-layout-btn.tap-feedback {
          transform:translateY(-2px) scale(.96);
          box-shadow:0 12px 22px color-mix(in srgb, var(--ma-accent) 22%, transparent);
        }
        .media-layout-btn .ui-ic { width:18px; height:18px; }
        .media-layout-btn.active {
          color:#18120a;
          background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
          box-shadow:0 10px 18px color-mix(in srgb, var(--ma-accent) 18%, transparent);
        }
        .media-items-list {
          display:grid;
          gap:16px;
          align-content:start;
        }
        .media-items-list.layout-grid {
          --media-grid-thumb-size:var(--flow-media-grid-thumb);
          grid-template-columns:repeat(auto-fill, minmax(156px, 1fr));
          grid-auto-rows:auto;
        }
        .card.layout-tablet .media-items-list.layout-grid {
          --media-grid-thumb-size:var(--flow-tablet-media-grid-thumb);
          grid-template-columns:repeat(auto-fill, minmax(204px, 1fr));
          gap:18px;
        }
        .media-items-list.layout-list {
          grid-template-columns:1fr;
        }
        .media-entry {
          width:100%;
          min-width:0;
          overflow:hidden;
          border:none;
          gap:10px;
        }
        .media-entry-main {
          min-width:0;
          flex:1;
          display:flex;
          align-items:center;
          gap:12px;
          border:none;
          background:none;
          color:inherit;
          padding:0;
          text-align:inherit;
          cursor:pointer;
        }
        .media-entry-actions {
          flex-shrink:0;
          display:inline-flex;
          align-items:center;
          gap:8px;
        }
        .media-more-btn {
          flex-shrink:0;
          min-width:38px;
          min-height:38px;
          width:38px;
          border-radius:14px;
          display:grid;
          place-items:center;
          color:var(--ma-accent);
        }
        .media-play-btn {
          flex-shrink:0;
          min-width:38px;
          min-height:38px;
          width:38px;
          border-radius:14px;
          display:grid;
          place-items:center;
          color:#fff;
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 34%, rgba(255,255,255,.12)), rgba(255,255,255,.08));
          border:1px solid color-mix(in srgb, var(--ma-accent) 28%, rgba(255,255,255,.14));
          box-shadow:0 12px 22px color-mix(in srgb, var(--ma-accent) 14%, transparent), inset 0 1px 0 rgba(255,255,255,.12);
        }
        .media-more-btn .ui-ic {
          width:17px;
          height:17px;
        }
        .media-play-btn .ui-ic {
          width:16px;
          height:16px;
          margin-inline-start:2px;
        }
        .theme-light .media-more-btn {
          color:var(--ma-accent);
          background:color-mix(in srgb, var(--ma-accent) 14%, rgba(255,255,255,.86));
          border:1px solid color-mix(in srgb, var(--ma-accent) 30%, rgba(147,161,183,.2));
          box-shadow:0 10px 18px color-mix(in srgb, var(--ma-accent) 14%, rgba(111,126,150,.12));
        }
        .theme-light .media-play-btn {
          color:#172033;
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 22%, white 78%), rgba(255,255,255,.9));
          border-color:color-mix(in srgb, var(--ma-accent) 32%, rgba(147,161,183,.22));
          box-shadow:0 10px 18px color-mix(in srgb, var(--ma-accent) 12%, rgba(111,126,150,.12));
        }
        .media-entry.list {
          min-height:82px;
          gap:12px;
          padding:14px 14px;
          align-items:center;
          border-radius:22px;
        }
        .media-entry.list .menu-thumb {
          width:52px;
          height:52px;
          border-radius:16px;
        }
        .media-entry .menu-thumb .ui-ic {
          width:44%;
          height:44%;
          opacity:.68;
        }
        .flag-thumb {
          font-size:26px;
          line-height:1;
        }
        .flag-emoji {
          display:block;
          filter:saturate(1.05);
        }
        .media-entry.grid {
          position:relative;
          display:grid;
          grid-template-columns:minmax(0,1fr);
          align-content:start;
          justify-items:center;
          gap:9px;
          padding:12px 12px 14px;
          min-height:calc(var(--media-grid-thumb-size, 188px) + 62px);
          border-radius:24px;
          background:linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.025));
          border:1px solid rgba(255,255,255,.07);
          box-shadow:0 12px 26px rgba(0,0,0,.1), inset 0 1px 0 rgba(255,255,255,.045);
          text-align:center;
        }
        .media-entry.grid .media-entry-main {
          display:grid;
          justify-items:center;
          align-content:start;
          gap:9px;
          width:100%;
          min-width:0;
        }
        .media-entry.grid .menu-thumb {
          width:min(100%, var(--media-grid-thumb-size, 150px));
          max-width:var(--media-grid-thumb-size, 188px);
          height:var(--media-grid-thumb-size, 150px);
          min-height:var(--media-grid-thumb-size, 150px);
          aspect-ratio:1/1;
          border-radius:20px;
          flex:0 0 auto;
          justify-self:center;
          box-shadow:0 16px 34px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.08);
        }
        .media-entry.grid .menu-thumb img {
          width:100%;
          height:100%;
          object-fit:contain;
          display:block;
        }
        .media-entry.grid .media-more-btn {
          position:absolute;
          inset-block-start:14px;
          inset-inline-start:14px;
          z-index:2;
          width:34px;
          min-width:34px;
          height:34px;
          min-height:34px;
          border-radius:13px;
          background:rgba(13,16,23,.44);
          border:1px solid rgba(255,255,255,.18);
          color:rgba(255,255,255,.74);
          box-shadow:0 10px 22px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.08);
          backdrop-filter:blur(12px);
          -webkit-backdrop-filter:blur(12px);
        }
        .media-entry.grid .media-play-btn {
          position:absolute;
          inset-block-start:14px;
          inset-inline-end:14px;
          z-index:2;
          width:34px;
          min-width:34px;
          height:34px;
          min-height:34px;
          border-radius:13px;
          background:rgba(var(--dynamic-accent-rgb,245 166 35) / .34);
          border:1px solid rgba(255,255,255,.2);
          color:rgba(255,255,255,.92);
          box-shadow:0 10px 22px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.1);
          backdrop-filter:blur(12px);
          -webkit-backdrop-filter:blur(12px);
        }
        .media-entry.grid .media-more-btn .ui-ic {
          width:15px;
          height:15px;
        }
        .media-entry.grid .media-play-btn .ui-ic {
          width:14px;
          height:14px;
        }
        .media-entry.grid .menu-item-title {
          width:100%;
          display:-webkit-box;
          -webkit-line-clamp:2;
          -webkit-box-orient:vertical;
          overflow:hidden;
          font-size:14px;
          line-height:1.16;
          font-weight:850;
          letter-spacing:0;
        }
        .media-entry.grid .menu-item-sub {
          margin-top:4px;
          display:-webkit-box;
          -webkit-line-clamp:1;
          -webkit-box-orient:vertical;
          overflow:hidden;
          font-size:11px;
          line-height:1.25;
          opacity:.72;
        }
        .theme-light .media-entry.grid {
          background:linear-gradient(180deg, rgba(255,255,255,.78), rgba(247,250,253,.58));
          border-color:rgba(132,147,168,.14);
          box-shadow:0 12px 26px rgba(80,98,124,.09), inset 0 1px 0 rgba(255,255,255,.52);
        }
        .theme-light .media-entry.grid .media-more-btn {
          background:rgba(255,255,255,.72);
          border-color:rgba(132,147,168,.22);
          color:#526176;
        }
        .theme-light .media-entry.grid .media-play-btn {
          background:color-mix(in srgb, var(--ma-accent) 22%, rgba(255,255,255,.82));
          border-color:color-mix(in srgb, var(--ma-accent) 30%, rgba(132,147,168,.22));
          color:#172033;
        }
        .media-detail-shell {
          display:grid;
          gap:14px;
          align-content:start;
        }
        .detail-popup-shell {
          height:100%;
          min-height:0;
          grid-template-rows:minmax(0,1fr);
        }
        .detail-popup-shell .library-body {
          height:100%;
          overflow:hidden;
          align-content:stretch;
        }
        .artist-detail-page-shell .library-body {
          overflow:auto;
          align-content:start;
        }
        .album-detail-shell {
          height:100%;
          min-height:0;
          grid-template-rows:auto auto minmax(0,1fr);
          align-content:stretch;
        }
        .media-detail-hero {
          display:grid;
          grid-template-columns:72px minmax(0,1fr) auto;
          align-items:center;
          gap:14px;
          padding:14px;
          border-radius:24px;
        }
        .album-detail-player {
          position:sticky;
          top:0;
          z-index:3;
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
        }
        .media-detail-art {
          width:72px;
          height:72px;
          border-radius:20px;
          display:grid;
          place-items:center;
          overflow:hidden;
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 22%, rgba(255,255,255,.08)), rgba(255,255,255,.06));
          border:1px solid rgba(255,255,255,.14);
          color:var(--ma-accent);
        }
        .media-detail-art img {
          width:100%;
          height:100%;
          object-fit:contain;
          object-position:center;
          display:block;
        }
        .media-detail-art .ui-ic {
          width:34%;
          height:34%;
        }
        .media-detail-copy {
          min-width:0;
          display:grid;
          gap:4px;
        }
        .media-detail-kicker {
          font-size:11px;
          font-weight:850;
          text-transform:uppercase;
          color:color-mix(in srgb, var(--ma-accent) 78%, white 22%);
          letter-spacing:.08em;
        }
        .media-detail-title {
          font-size:18px;
          font-weight:950;
          line-height:1.15;
          overflow:hidden;
          display:-webkit-box;
          -webkit-line-clamp:2;
          -webkit-box-orient:vertical;
        }
        .media-detail-sub {
          font-size:12px;
          color:rgba(255,255,255,.66);
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }
        .media-detail-kind-badge {
          display:inline-flex;
          vertical-align:middle;
          margin-inline-start:8px;
          padding:3px 8px;
          border-radius:999px;
          font-size:10px;
          font-weight:900;
          color:color-mix(in srgb, var(--ma-accent) 78%, white 22%);
          background:color-mix(in srgb, var(--ma-accent) 14%, rgba(255,255,255,.07));
          border:1px solid color-mix(in srgb, var(--ma-accent) 26%, rgba(255,255,255,.12));
        }
        .media-detail-album-picker {
          min-width:0;
          display:grid;
          grid-template-columns:auto minmax(0,1fr);
          align-items:center;
          gap:8px;
          margin-top:4px;
        }
        .media-detail-picker-label {
          font-size:10px;
          font-weight:950;
          letter-spacing:.08em;
          text-transform:uppercase;
          color:rgba(255,255,255,.48);
        }
        .media-detail-album-picker select {
          min-width:0;
          width:100%;
          height:36px;
          border-radius:14px;
          padding:0 34px 0 12px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.075);
          color:rgba(255,255,255,.9);
          font:inherit;
          font-size:12px;
          font-weight:850;
          outline:none;
        }
        .media-detail-album-picker select option {
          color:#172033;
          background:#fff;
        }
        .media-detail-play-btn {
          width:46px;
          min-width:46px;
          height:46px;
          border-radius:16px;
          display:grid;
          place-items:center;
          color:#fff;
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 42%, rgba(255,255,255,.12)), rgba(255,255,255,.08));
          border:1px solid color-mix(in srgb, var(--ma-accent) 30%, rgba(255,255,255,.14));
          box-shadow:0 14px 28px color-mix(in srgb, var(--ma-accent) 16%, transparent), inset 0 1px 0 rgba(255,255,255,.14);
        }
        .media-detail-play-btn .ui-ic {
          width:18px;
          height:18px;
          margin-inline-start:2px;
        }
        .media-detail-play-btn.subtle {
          background:rgba(255,255,255,.08);
          border-color:rgba(255,255,255,.14);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.1);
        }
        .media-detail-player-actions {
          display:flex;
          align-items:center;
          justify-content:flex-end;
          gap:8px;
        }
        .media-detail-nav-btn {
          width:38px;
          min-width:38px;
          height:38px;
          border-radius:14px;
          display:grid;
          place-items:center;
          padding:0;
          background:rgba(255,255,255,.07);
          border:1px solid rgba(255,255,255,.12);
          color:rgba(255,255,255,.82);
        }
        .media-detail-nav-btn[disabled] {
          opacity:.36;
          cursor:default;
        }
        .media-detail-browse-count {
          min-width:38px;
          text-align:center;
          font-size:11px;
          font-weight:900;
          color:rgba(255,255,255,.58);
        }
        .media-detail-nav-btn .ui-ic {
          width:17px;
          height:17px;
        }
        .media-detail-toolbar {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
          min-width:0;
        }
        .media-detail-toolbar .media-section-title {
          min-width:0;
          margin:0;
        }
        .media-detail-count-badge {
          padding:6px 10px;
          border-radius:999px;
          font-size:11px;
          font-weight:850;
          color:rgba(255,255,255,.68);
          background:rgba(255,255,255,.07);
          border:1px solid rgba(255,255,255,.1);
        }
        .media-detail-empty {
          min-height:88px;
          display:grid;
          align-items:center;
        }
        .media-detail-track-list {
          min-height:0;
          overflow:auto;
          display:grid;
          align-content:start;
          gap:10px;
          padding:0 2px 4px;
        }
        .media-detail-track-row {
          min-height:64px;
          display:grid;
          grid-template-columns:28px minmax(0,1fr) auto auto;
          align-items:center;
          gap:10px;
          padding:10px;
          border-radius:18px;
          border:1px solid rgba(255,255,255,.1);
          background:linear-gradient(180deg, rgba(255,255,255,.075), rgba(255,255,255,.035));
          box-shadow:inset 0 1px 0 rgba(255,255,255,.08);
        }
        .media-detail-track-index {
          width:28px;
          height:28px;
          border-radius:999px;
          display:grid;
          place-items:center;
          font-size:12px;
          font-weight:900;
          color:rgba(255,255,255,.62);
          background:rgba(255,255,255,.06);
        }
        .media-detail-track-copy {
          min-width:0;
          display:grid;
          gap:3px;
        }
        .media-detail-track-title {
          min-width:0;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          font-size:14px;
          font-weight:850;
          color:rgba(255,255,255,.94);
        }
        .media-detail-track-sub {
          min-width:0;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          font-size:11px;
          font-weight:650;
          color:rgba(255,255,255,.56);
        }
        .media-detail-track-duration {
          font-size:11px;
          font-weight:800;
          color:rgba(255,255,255,.48);
        }
        .media-detail-track-actions {
          display:flex;
          align-items:center;
          gap:6px;
        }
        .media-detail-action-btn {
          width:34px;
          min-width:34px;
          height:34px;
          border-radius:12px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.07);
          color:rgba(255,255,255,.9);
          display:grid;
          place-items:center;
          padding:0;
          cursor:pointer;
        }
        .media-detail-action-btn.primary {
          color:#15110b;
          background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
          border-color:transparent;
        }
        .media-detail-action-btn.active {
          color:color-mix(in srgb, var(--ma-accent) 82%, white 18%);
          border-color:color-mix(in srgb, var(--ma-accent) 38%, rgba(255,255,255,.14));
          background:color-mix(in srgb, var(--ma-accent) 16%, rgba(255,255,255,.07));
        }
        .media-detail-action-btn .ui-ic {
          width:17px;
          height:17px;
        }
        .theme-light .media-detail-track-row {
          background:linear-gradient(180deg, rgba(255,255,255,.78), rgba(247,250,253,.56));
          border-color:rgba(132,147,168,.16);
        }
        .theme-light .media-detail-track-title { color:#202736; }
        .theme-light .media-detail-track-sub,
        .theme-light .media-detail-track-duration,
        .theme-light .media-detail-track-index { color:#68748a; }
        .theme-light .media-detail-action-btn {
          background:rgba(255,255,255,.72);
          border-color:rgba(132,147,168,.2);
          color:#526176;
        }
        .theme-light .media-detail-nav-btn {
          background:rgba(255,255,255,.72);
          border-color:rgba(132,147,168,.2);
          color:#526176;
        }
        .theme-light .media-detail-browse-count {
          color:#68748a;
        }
        .theme-light .media-detail-action-btn.primary {
          color:#14110a;
          border-color:transparent;
          background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
        }
        @media (max-width:520px) {
          .media-detail-hero {
            grid-template-columns:58px minmax(0,1fr) auto;
            gap:10px;
            padding:11px;
            border-radius:20px;
          }
          .media-detail-art {
            width:58px;
            height:58px;
            border-radius:16px;
          }
          .media-detail-player-actions {
            flex-direction:column;
            gap:5px;
          }
          .media-detail-play-btn {
            width:38px;
            min-width:38px;
            height:38px;
            border-radius:13px;
          }
          .media-detail-track-row {
            grid-template-columns:24px minmax(0,1fr) auto;
            gap:8px;
            padding:9px;
          }
          .media-detail-track-duration {
            display:none;
          }
          .media-detail-track-actions {
            gap:4px;
          }
          .media-detail-action-btn {
            width:31px;
            min-width:31px;
            height:31px;
            border-radius:11px;
          }
        }
        .artist-detail-shell {
          gap:16px;
        }
        .artist-detail-hero {
          display:grid;
          grid-template-columns:96px minmax(0,1fr);
          align-items:center;
          gap:16px;
          padding:16px;
          border-radius:24px;
          background:linear-gradient(145deg, color-mix(in srgb, var(--ma-accent) 16%, rgba(255,255,255,.08)), rgba(255,255,255,.055));
          border:1px solid rgba(255,255,255,.12);
          box-shadow:0 18px 36px rgba(0,0,0,.14), inset 0 1px 0 rgba(255,255,255,.06);
        }
        .artist-detail-art {
          width:96px;
          aspect-ratio:1/1;
          border-radius:22px;
          overflow:hidden;
          display:grid;
          place-items:center;
          background:rgba(255,255,255,.08);
          color:var(--ma-accent);
          border:1px solid rgba(255,255,255,.14);
        }
        .artist-detail-art img {
          width:100%;
          height:100%;
          object-fit:contain;
          object-position:center;
          display:block;
        }
        .artist-detail-copy {
          min-width:0;
          display:grid;
          gap:7px;
          justify-items:start;
        }
        .artist-detail-title {
          font-size:24px;
          line-height:1.08;
          font-weight:950;
          overflow:hidden;
          display:-webkit-box;
          -webkit-line-clamp:2;
          -webkit-box-orient:vertical;
        }
        .artist-detail-description {
          color:rgba(255,255,255,.72);
          font-size:13px;
          line-height:1.35;
          display:-webkit-box;
          -webkit-line-clamp:4;
          -webkit-box-orient:vertical;
          overflow:hidden;
        }
        .artist-detail-description.muted {
          color:rgba(255,255,255,.52);
        }
        .artist-info-btn {
          width:38px;
          min-width:38px;
          min-height:36px;
          padding:0;
          border-radius:14px;
          border:1px solid color-mix(in srgb, var(--ma-accent) 34%, rgba(255,255,255,.14));
          background:color-mix(in srgb, var(--ma-accent) 16%, rgba(255,255,255,.07));
          color:color-mix(in srgb, var(--ma-accent) 82%, white 18%);
          display:inline-flex;
          align-items:center;
          justify-content:center;
          font:inherit;
          font-size:12px;
          font-weight:950;
          cursor:pointer;
        }
        .artist-info-btn .ui-ic {
          width:16px;
          height:16px;
        }
        .artist-info-backdrop {
          position:absolute;
          inset:0;
          z-index:25;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:18px;
          background:rgba(5,7,12,.58);
          backdrop-filter:blur(12px);
          -webkit-backdrop-filter:blur(12px);
        }
        .artist-info-dialog {
          width:min(100%, 620px);
          max-height:min(620px, calc(100% - 20px));
          display:grid;
          grid-template-rows:auto minmax(0,1fr);
          overflow:hidden;
          border-radius:24px;
          border:1px solid rgba(255,255,255,.14);
          background:linear-gradient(180deg, rgba(26,29,40,.96), rgba(12,14,22,.98));
          box-shadow:0 24px 60px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.08);
          color:rgba(255,255,255,.9);
        }
        .artist-info-head {
          min-height:58px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          padding:14px 16px;
          border-bottom:1px solid rgba(255,255,255,.1);
        }
        .artist-info-title {
          min-width:0;
          font-size:18px;
          font-weight:950;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }
        .artist-info-close {
          width:40px;
          min-width:40px;
          height:40px;
          border-radius:14px;
          border:1px solid rgba(255,255,255,.14);
          background:rgba(255,255,255,.08);
          color:inherit;
          display:grid;
          place-items:center;
          padding:0;
          cursor:pointer;
        }
        .artist-info-body {
          overflow:auto;
          padding:16px;
          color:rgba(255,255,255,.74);
          font-size:14px;
          line-height:1.48;
          white-space:pre-wrap;
        }
        .theme-light .artist-info-btn {
          background:color-mix(in srgb, var(--ma-accent) 13%, rgba(255,255,255,.9));
          border-color:color-mix(in srgb, var(--ma-accent) 26%, rgba(147,161,183,.22));
          color:#172033;
        }
        .theme-light .artist-info-backdrop {
          background:rgba(225,232,243,.58);
        }
        .theme-light .artist-info-dialog {
          background:linear-gradient(180deg, rgba(255,255,255,.98), rgba(245,248,253,.98));
          border-color:rgba(147,161,183,.2);
          color:#172033;
          box-shadow:0 24px 60px rgba(80,98,124,.18), inset 0 1px 0 rgba(255,255,255,.62);
        }
        .theme-light .artist-info-head {
          border-bottom-color:rgba(147,161,183,.18);
        }
        .theme-light .artist-info-close {
          background:rgba(255,255,255,.78);
          border-color:rgba(147,161,183,.22);
        }
        .theme-light .artist-info-body {
          color:#536176;
        }
        .artist-detail-search,
        .artist-detail-section,
        .artist-year-group {
          min-width:0;
          display:grid;
          gap:10px;
        }
        .artist-section-head {
          min-width:0;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
        }
        .artist-section-actions {
          min-width:0;
          display:flex;
          align-items:center;
          justify-content:flex-end;
          gap:8px;
        }
        .artist-search-shell {
          display:grid;
          grid-template-columns:auto minmax(0,1fr) auto;
          align-items:center;
        }
        .artist-search-btn {
          min-height:38px;
          padding:0 14px;
          border-radius:14px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:6px;
        }
        .artist-search-btn .ui-ic {
          width:16px;
          height:16px;
        }
        .artist-year-title {
          color:color-mix(in srgb, var(--ma-accent) 78%, white 22%);
          font-size:13px;
          font-weight:950;
          padding-inline:2px;
        }
        .theme-light .artist-detail-hero {
          background:linear-gradient(145deg, color-mix(in srgb, var(--ma-accent) 13%, rgba(255,255,255,.9)), rgba(246,249,253,.74));
          border-color:rgba(147,161,183,.18);
          box-shadow:0 18px 34px rgba(110,127,153,.13), inset 0 1px 0 rgba(255,255,255,.48);
        }
        .theme-light .artist-detail-description {
          color:#586579;
        }
        .theme-light .artist-detail-description.muted {
          color:#7e8999;
        }
        @media (max-width: 430px) {
          .artist-detail-hero {
            grid-template-columns:78px minmax(0,1fr);
            gap:12px;
            padding:13px;
          }
          .artist-detail-art {
            width:78px;
            border-radius:20px;
          }
          .artist-detail-title {
            font-size:20px;
          }
          .artist-detail-description {
            -webkit-line-clamp:3;
          }
          .artist-search-shell {
            grid-template-columns:auto minmax(0,1fr);
          }
          .artist-search-btn {
            grid-column:1 / -1;
            width:100%;
          }
        }
        .theme-light .media-detail-sub {
          color:#536176;
        }
        .theme-light .media-detail-kind-badge {
          color:#172033;
          background:color-mix(in srgb, var(--ma-accent) 12%, rgba(255,255,255,.82));
          border-color:color-mix(in srgb, var(--ma-accent) 24%, rgba(147,161,183,.22));
        }
        .theme-light .media-detail-picker-label {
          color:#768196;
        }
        .theme-light .media-detail-album-picker select {
          background:rgba(255,255,255,.78);
          border-color:rgba(147,161,183,.22);
          color:#172033;
        }
        .theme-light .media-detail-play-btn {
          color:#172033;
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 24%, white 76%), rgba(255,255,255,.9));
          border-color:color-mix(in srgb, var(--ma-accent) 32%, rgba(147,161,183,.22));
        }
        .media-section-title {
          font-size:12px;
          letter-spacing:.12em;
          text-transform:uppercase;
          color:rgba(255,255,255,.56);
          margin:4px 2px 0;
        }
        .radio-browser-country-head {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          margin:4px 0 12px;
        }
        .radio-browser-country-head .media-section-title {
          flex:1;
          margin:0;
        }
        .radio-country-entry {
          cursor:pointer;
        }
        .queue-list {
          display:grid;
          gap:16px;
          align-content:start;
        }
        .menu-body.sheet-queue-flow {
          position:relative;
          overflow:hidden;
          padding:0;
          display:grid;
          place-items:center;
          align-content:stretch;
        }
        .queue-flow-stage {
          position:relative;
          width:100%;
          height:100%;
          min-height:0;
          display:grid;
          place-items:center;
        }
        .library-flow-panel {
          width:100%;
          min-width:0;
          display:grid;
          min-height:clamp(360px, 62dvh, 720px);
        }
        .library-flow-stage {
          min-height:clamp(360px, 62dvh, 720px);
        }
        .menu-body.sheet-queue-flow .library-flow-stage {
          height:100%;
          min-height:0;
        }
        .artist-detail-section .library-flow-panel,
        .artist-detail-section .library-flow-stage {
          min-height:clamp(340px, 56dvh, 620px);
        }
        .menu-body.library-flow-mode .library-body {
          align-content:stretch!important;
        }
        .queue-flow-picker {
          --queue-flow-art-size:clamp(124px, 52vw, 196px);
          width:min(100%, calc(var(--queue-flow-art-size) + 54px));
          height:100%;
          min-height:0;
          margin:0 auto;
          padding:clamp(118px, 20dvh, 178px) 0;
          overflow-y:auto;
          overflow-x:hidden;
          overscroll-behavior:contain;
          -webkit-overflow-scrolling:touch;
          scroll-snap-type:y proximity;
          scrollbar-width:none;
          perspective:820px;
          transform-style:preserve-3d;
          mask-image:linear-gradient(180deg, transparent, #000 13%, #000 87%, transparent);
          -webkit-mask-image:linear-gradient(180deg, transparent, #000 13%, #000 87%, transparent);
        }
        .queue-flow-picker::-webkit-scrollbar {
          display:none;
        }
        .queue-flow-track {
          display:grid;
          justify-items:center;
          gap:22px;
          align-content:start;
          padding:2px 0;
        }
        .queue-flow-item {
          width:var(--queue-flow-art-size);
          min-width:0;
          min-height:var(--queue-flow-art-size);
          display:grid;
          grid-template-rows:var(--queue-flow-art-size);
          justify-items:center;
          align-items:start;
          gap:0;
          padding:0;
          border:0;
          border-radius:0;
          background:transparent;
          color:#fff;
          text-align:center;
          cursor:pointer;
          scroll-snap-align:center;
          opacity:var(--queue-flow-opacity, .28);
          filter:saturate(var(--queue-flow-saturate, .74)) brightness(var(--queue-flow-brightness, .78)) blur(var(--queue-flow-blur, .8px));
          transform:perspective(820px) rotateX(var(--queue-flow-rotate, 0deg)) translateY(var(--queue-flow-y, 0px)) translateZ(var(--queue-flow-z, -58px)) scale(var(--queue-flow-scale, .72));
          transform-origin:center center;
          transition:opacity .07s linear, transform .07s linear, filter .07s linear;
        }
        .queue-flow-item.centered {
          opacity:var(--queue-flow-opacity, 1);
          filter:saturate(var(--queue-flow-saturate, 1)) brightness(var(--queue-flow-brightness, 1)) blur(var(--queue-flow-blur, 0px));
          transform:perspective(820px) rotateX(var(--queue-flow-rotate, 0deg)) translateY(var(--queue-flow-y, 0px)) translateZ(var(--queue-flow-z, 30px)) scale(var(--queue-flow-scale, 1.06));
        }
        .queue-flow-item.tap-feedback {
          opacity:1;
          filter:saturate(1.06) brightness(1.08) blur(0);
          transform:perspective(820px) rotateX(var(--queue-flow-rotate, 0deg)) translateY(var(--queue-flow-y, 0px)) translateZ(44px) scale(1.1);
        }
        .queue-flow-item.queue-flow-static {
          cursor:default;
          pointer-events:none;
        }
        .queue-flow-item.queue-flow-static:disabled {
          color:inherit;
        }
        .queue-flow-item:focus-visible {
          outline:2px solid color-mix(in srgb, var(--ma-accent) 70%, white 30%);
          outline-offset:8px;
        }
        .queue-flow-art {
          width:var(--queue-flow-art-size);
          aspect-ratio:1/1;
          border-radius:26px;
          overflow:hidden;
          display:grid;
          place-items:center;
          background:rgba(255,255,255,.08);
          color:var(--ma-accent);
          box-shadow:0 20px 44px rgba(0,0,0,.28);
          transition:outline-color .14s ease, box-shadow .14s ease;
        }
        .queue-flow-item.active .queue-flow-art {
          outline:2px solid color-mix(in srgb, var(--ma-accent) 68%, white 32%);
          outline-offset:4px;
          box-shadow:
            0 20px 44px rgba(0,0,0,.28),
            0 0 24px color-mix(in srgb, var(--ma-accent) 18%, transparent);
        }
        .queue-flow-item.queue-flow-selecting .queue-flow-art {
          outline:2px solid color-mix(in srgb, var(--ma-accent) 82%, white 18%);
          outline-offset:6px;
          box-shadow:
            0 20px 44px rgba(0,0,0,.28),
            0 0 34px color-mix(in srgb, var(--ma-accent) 30%, transparent);
        }
        .queue-flow-art img {
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        }
        .queue-flow-art .ui-ic {
          width:42px;
          height:42px;
        }
        .queue-flow-caption {
          position:absolute;
          inset-inline:22px;
          inset-block-end:16px;
          z-index:7;
          min-height:42px;
          display:grid;
          align-content:center;
          gap:3px;
          text-align:center;
          pointer-events:none;
          color:#fff;
          text-shadow:0 2px 10px rgba(0,0,0,.38);
        }
        .queue-flow-caption[hidden] {
          display:none !important;
        }
        .queue-flow-caption-title,
        .queue-flow-caption-artist {
          min-width:0;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }
        .queue-flow-caption-title {
          font-size:13px;
          line-height:1.14;
          font-weight:950;
        }
        .queue-flow-caption-artist {
          color:rgba(255,255,255,.62);
          font-size:11px;
          line-height:1.12;
          font-weight:760;
        }
        .card.layout-tablet .menu-sheet.sheet-queue-flow {
          width:min(calc(100% - 80px), 390px) !important;
          max-width:min(calc(100% - 80px), 390px) !important;
          height:min(780px, calc(100% - 44px)) !important;
          max-height:calc(100% - 44px) !important;
          align-self:center;
          margin:auto;
        }
        .card.layout-tablet .menu-body.sheet-queue-flow {
          padding:0;
        }
        .card.layout-tablet .queue-flow-picker {
          --queue-flow-art-size:204px;
        }
        /* The sheet owns the glass effect. Repeated backdrop surfaces on every
           scrolling tile and its buttons cause expensive repainting. */
        .card #mobileMenu #mobileMenuBody .media-items-list .media-entry,
        .card #mobileMenu #mobileMenuBody .media-items-list .media-entry .chip-btn {
          backdrop-filter:none!important;
          -webkit-backdrop-filter:none!important;
        }
        `;
}
