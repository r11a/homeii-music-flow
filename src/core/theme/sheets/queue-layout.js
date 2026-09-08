// queue-layout styles. Order is preserved by card-styles.js.
export default function() {
  return `.queue-playback-speed { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:12px 16px; margin-block:8px; border:1px solid var(--homeii-surface-border); border-radius:18px; color:var(--homeii-surface-text); font:inherit; }
.queue-playback-speed select { min-height:44px; min-width:96px; font:inherit; }
.menu-list-item,
.queue-row,
.media-entry.grid,
.player-menu-card,
.settings-group{
  box-shadow:0 18px 42px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.055);
}
.media-entry.grid,
.queue-row,
.menu-list-item{
  background:
    linear-gradient(145deg, rgba(255,255,255,.092), rgba(255,255,255,.045)),
    radial-gradient(circle at 14% 12%, rgba(var(--dynamic-accent-rgb,245 166 35) / .10), transparent 38%)!important;
  border:1px solid rgba(255,255,255,.12)!important;
}
.queue-more-btn,
.media-more-btn,
.media-play-btn{
  background:rgba(255,255,255,.075)!important;
  border:1px solid rgba(255,255,255,.14)!important;
  color:rgba(255,255,255,.82)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.06);
}
.queue-more-btn .ui-ic,
.media-more-btn .ui-ic,
.media-play-btn .ui-ic{
  width:18px!important;
  height:18px!important;
}
.theme-light .menu-sheet,
.theme-light .queue-action-sheet,
.theme-light .history-drawer{
  background:
    radial-gradient(circle at 16% 4%, rgba(var(--dynamic-accent-rgb,245 166 35) / .18), transparent 34%),
    radial-gradient(circle at 86% 18%, rgba(59,130,246,.10), transparent 34%),
    linear-gradient(180deg, rgba(250,252,255,.97), rgba(238,243,249,.96))!important;
  color:#172033!important;
  border-color:rgba(123,139,164,.24)!important;
  box-shadow:0 24px 58px rgba(86,104,132,.18)!important;
}
.card.dynamic-theme .history-drawer{
  overflow:hidden;
  isolation:isolate;
}
.card.dynamic-theme .history-drawer::before{
  content:"";
  position:absolute;
  inset:-24px;
  background:var(--dynamic-art-url, none) center/cover no-repeat;
  filter:blur(30px) saturate(1.1);
  transform:scale(1.08);
  opacity:calc(.2 * var(--dynamic-theme-strength, .82));
  pointer-events:none;
  z-index:0;
}
.card.dynamic-theme .history-drawer::after{
  content:"";
  position:absolute;
  inset:0;
  background:
    radial-gradient(circle at 18% 8%, rgba(var(--dynamic-glow-rgb,255 178 56) / calc(.16 * var(--dynamic-theme-strength, .82))), transparent 34%),
    linear-gradient(180deg, rgba(14,17,24,.76), rgba(10,13,20,.9));
  pointer-events:none;
  z-index:0;
}
.theme-light.card.dynamic-theme .history-drawer::after{
  background:
    radial-gradient(circle at 18% 8%, rgba(var(--dynamic-glow-rgb,255 178 56) / calc(.1 * var(--dynamic-theme-strength, .82))), transparent 34%),
    linear-gradient(180deg, rgba(255,255,255,.82), rgba(244,248,253,.92));
}
.card.dynamic-theme .history-drawer>*{
  position:relative;
  z-index:1;
}
.card.performance-lite .history-drawer::before,
.card.performance-lite .history-drawer::after{
  display:none!important;
}
.theme-light .menu-body,
.theme-light .library-shell,
.theme-light .media-home-shell,
.theme-light .media-results,
.theme-light .settings-group,
.theme-light .queue-list{
  color:#172033!important;
}
.theme-light .menu-item,
.theme-light .menu-list-item,
.theme-light .queue-row,
.theme-light .media-entry.grid,
.theme-light .settings-group,
.theme-light .notice{
  background:
    linear-gradient(145deg, rgba(255,255,255,.92), rgba(242,246,251,.82)),
    radial-gradient(circle at 12% 12%, rgba(var(--dynamic-accent-rgb,245 166 35) / .11), transparent 42%)!important;
  border:1px solid rgba(123,139,164,.20)!important;
  color:#172033!important;
  box-shadow:0 14px 34px rgba(86,104,132,.12), inset 0 1px 0 rgba(255,255,255,.65)!important;
}
.theme-light .menu-item-title,
.theme-light .queue-title,
.theme-light .media-section-title,
.theme-light .settings-label,
.theme-light .history-drawer-title,
.theme-light .player-premium-name{
  color:#172033!important;
}
.theme-light .menu-item-sub,
.theme-light .queue-sub,
.theme-light .player-premium-track,
.theme-light .settings-hint{
  color:#536176!important;
}
.theme-light .queue-more-btn,
.theme-light .media-more-btn,
.theme-light .media-play-btn{
  background:rgba(255,255,255,.88)!important;
  border-color:rgba(123,139,164,.24)!important;
  color:#4b586b!important;
}
.theme-light .media-sort-select,
.theme-light .settings-select,
.theme-light .settings-text-input,
.theme-light .announcement-textarea,
.theme-light .media-search-shell{
  background:rgba(255,255,255,.9)!important;
  color:#172033!important;
  border-color:rgba(123,139,164,.24)!important;
}
.theme-light .media-sort-select option,
.theme-light .settings-select option{
  background:#ffffff;
  color:#172033;
}
.library-shell{
  grid-template-rows:minmax(0,1fr) auto!important;
}
.library-toolbar{
  display:flex!important;
  align-items:center!important;
  justify-content:space-between!important;
  gap:12px!important;
  flex-wrap:wrap;
  margin:0 0 10px!important;
}
.library-toolbar-actions{
  display:flex;
  align-items:center;
  gap:9px;
  min-width:0;
  flex:1 1 320px;
  flex-wrap:wrap;
}
.library-toolbar .library-player-focus{
  flex:0 1 max-content;
  width:auto!important;
  max-width:min(100%, 360px);
  justify-self:end;
}
.card.layout-tablet .library-toolbar{
  flex-wrap:nowrap;
  width:min(100%, 940px);
  margin-inline:auto!important;
}
.card.layout-tablet .library-toolbar-actions{
  flex:0 1 auto;
}
.card.layout-tablet .library-toolbar .media-layout-toggle{
  background:transparent!important;
  border:none!important;
  box-shadow:none!important;
  padding:0!important;
  gap:8px!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
.card.layout-tablet .library-toolbar .media-layout-btn{
  width:44px;
  min-width:44px;
  height:44px;
  min-height:44px;
  border-radius:999px!important;
  background:rgba(255,255,255,.09);
  border:1px solid rgba(255,255,255,.12);
}
.card.layout-tablet .library-toolbar .library-player-focus{
  max-width:min(44%, 360px);
  min-height:52px;
  padding:7px 11px;
  border-radius:999px;
  grid-template-columns:38px minmax(104px, 1fr) auto auto;
}
.card.layout-tablet .library-toolbar .library-player-art{
  width:38px;
  height:38px;
  border-radius:999px;
}
.library-player-state{
  color:rgba(255,255,255,.62)!important;
  background:transparent!important;
  border:none!important;
  padding:0!important;
  font-size:11px;
  font-weight:780;
  overflow:hidden;
  white-space:nowrap;
  text-overflow:ellipsis;
}
.library-player-focus.is-playing .library-player-state{
  color:rgba(255,255,255,.76)!important;
}
.player-premium-title-row{
  display:flex;
  align-items:center;
  gap:9px;
  min-width:0;
}
.player-premium-title-row .player-premium-name{
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.player-premium-bars{
  flex:0 0 auto;
  width:18px!important;
  height:15px!important;
  color:var(--ma-accent);
}
.player-premium-state{
  display:none!important;
}
.players-action-hub{
  width:min(100%, 760px);
  margin:0 auto 14px;
  display:grid;
  grid-template-columns:repeat(4, minmax(0,1fr));
  gap:8px;
}
.players-action-chip{
  min-width:0;
  min-height:58px;
  border-radius:18px;
  border:1px solid rgba(255,255,255,.12);
  background:linear-gradient(180deg, rgba(255,255,255,.095), rgba(255,255,255,.045));
  color:inherit;
  display:grid;
  place-items:center;
  gap:4px;
  padding:8px 6px;
  font:inherit;
  font-size:11px;
  font-weight:900;
  cursor:pointer;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.06);
}
.players-action-chip .ui-ic{
  width:19px;
  height:19px;
}
.players-action-chip strong{
  color:var(--ma-accent);
  font-size:12px;
  line-height:1;
}
.players-action-chip.danger{
  color:#ffb4b4;
  border-color:rgba(255,105,105,.22);
  background:rgba(255,72,72,.11);
}
.card.layout-mobile .players-action-hub{
  grid-template-columns:repeat(4, minmax(0,1fr));
}
.this-device-strip{
  width:min(100%, 520px)!important;
  margin:0 auto 12px!important;
  padding:0!important;
  background:transparent!important;
  border:none!important;
  box-shadow:none!important;
}
.this-device-toggle{
  width:100%!important;
  justify-content:center!important;
  min-height:46px!important;
  gap:9px!important;
  padding:0 16px!important;
  border-radius:999px!important;
  border:1px solid rgba(160,170,185,.38)!important;
  background:rgba(255,255,255,.045)!important;
  color:inherit!important;
  box-shadow:none!important;
}
.this-device-dot{
  width:9px;
  height:9px;
  border-radius:999px;
  background:#9ca3af;
  box-shadow:0 0 0 4px rgba(156,163,175,.14);
}
.this-device-toggle.active .this-device-dot{
  background:#36d67a;
  box-shadow:0 0 0 4px rgba(54,214,122,.16);
}
.this-device-toggle-label{
  font-weight:930;
  white-space:nowrap;
}
.this-device-toggle-status{
  color:rgba(255,255,255,.58);
  font-size:11px;
  font-weight:850;
  white-space:nowrap;
}
.queue-page-head-title{
  flex:1 1 auto;
}
.queue-head-transfer-btn{
  margin-inline-start:auto;
}
.queue-page-count{
  margin-inline-start:0!important;
  min-width:54px;
  justify-content:center;
}
.queue-page-count .ui-ic{
  width:17px;
  height:17px;
}
.queue-move-select{
  width:100%;
  min-width:72px;
  height:36px;
  border-radius:13px;
  border:1px solid rgba(255,255,255,.14);
  background:rgba(255,255,255,.08);
  color:inherit;
  font:inherit;
  font-size:13px;
  font-weight:900;
  text-align:center;
  outline:none;
  padding:0 10px;
}
.queue-move-select option{
  color:#111827;
  background:#fff;
}
.queue-inline-move select{
  height:34px;
  border-radius:12px;
}
.queue-move-control{
  grid-template-columns:minmax(0,1fr)!important;
}
.theme-light .menu-sheet,
.theme-light .queue-action-sheet,
.theme-light .history-drawer{
  background:
    radial-gradient(circle at 14% 0%, rgba(var(--dynamic-accent-rgb,245 166 35) / .10), transparent 28%),
    linear-gradient(180deg, rgba(255,255,255,.995), rgba(241,245,249,.985))!important;
  color:#0f172a!important;
  text-shadow:none!important;
}
.theme-light .menu-sheet *,
.theme-light .queue-action-sheet *,
.theme-light .history-drawer *{
  text-shadow:none!important;
}
.theme-light .menu-sheet button,
.theme-light .menu-sheet select,
.theme-light .menu-sheet input,
.theme-light .queue-action-sheet button,
.theme-light .queue-action-sheet select,
.theme-light .queue-action-sheet input{
  color:#0f172a;
}
.theme-light .menu-item-title,
.theme-light .queue-title,
.theme-light .media-section-title,
.theme-light .player-premium-name,
.theme-light .library-player-name,
.theme-light .settings-label{
  color:#0f172a!important;
}
.theme-light .menu-item-sub,
.theme-light .queue-sub,
.theme-light .player-premium-track,
.theme-light .library-player-state,
.theme-light .settings-hint,
.theme-light .this-device-toggle-status{
  color:#475569!important;
}
.theme-light .menu-thumb,
.theme-light .library-player-art,
.theme-light .player-premium-art{
  background:#f8fafc!important;
  border-color:rgba(100,116,139,.22)!important;
  color:#334155!important;
}
.theme-light .media-layout-toggle,
.theme-light .library-nav{
  background:rgba(255,255,255,.92)!important;
  border-color:rgba(100,116,139,.22)!important;
  box-shadow:0 12px 26px rgba(71,85,105,.10)!important;
}
.theme-light .card.layout-tablet .library-toolbar .media-layout-toggle{
  background:transparent!important;
  border:none!important;
  box-shadow:none!important;
}
.theme-light .media-layout-btn:not(.active),
.theme-light .library-nav-btn:not(.active),
.theme-light .players-action-chip{
  color:#334155!important;
  background:rgba(255,255,255,.94)!important;
  border:1px solid rgba(100,116,139,.20)!important;
}
.theme-light .library-player-focus,
.theme-light .player-menu-card,
.theme-light .group-player-card,
.theme-light .menu-list-item,
.theme-light .queue-row,
.theme-light .settings-group,
.theme-light .notice{
  background:linear-gradient(145deg, rgba(255,255,255,.98), rgba(248,250,252,.92))!important;
  border-color:rgba(100,116,139,.22)!important;
  color:#0f172a!important;
  box-shadow:0 14px 32px rgba(71,85,105,.11), inset 0 1px 0 rgba(255,255,255,.78)!important;
}
.theme-light .players-action-chip.danger{
  color:#b4232b!important;
  border-color:rgba(180,35,43,.20)!important;
  background:rgba(255,241,242,.96)!important;
}
.theme-light .this-device-toggle{
  border-color:rgba(100,116,139,.30)!important;
  background:rgba(255,255,255,.94)!important;
}
.theme-light .queue-move-select{
  background:#fff!important;
  color:#0f172a!important;
  border-color:rgba(100,116,139,.24)!important;
}
.player-premium-bars{
  display:inline-flex!important;
  align-items:flex-end!important;
  justify-content:center!important;
  gap:3px!important;
}
.player-premium-bars.is-active{
  color:var(--ma-accent)!important;
}
.player-premium-bars.is-static{
  color:rgba(190,198,210,.58)!important;
}
.player-premium-bars.is-static span{
  animation:none!important;
  transform:none!important;
  opacity:.82!important;
  background:currentColor!important;
}
.player-premium-bars.is-static span:nth-child(1){height:6px!important;}
.player-premium-bars.is-static span:nth-child(2){height:11px!important;}
.player-premium-bars.is-static span:nth-child(3){height:8px!important;}
.theme-light .player-premium-bars.is-static{
  color:rgba(100,116,139,.58)!important;
}
.players-action-hub{
  width:min(100%, 620px)!important;
  grid-template-columns:repeat(4, minmax(0,1fr))!important;
  gap:7px!important;
}
.players-action-chip{
  min-height:46px!important;
  border-radius:999px!important;
  padding:6px 8px!important;
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  gap:6px!important;
  font-size:10px!important;
}
.players-action-chip .ui-ic{
  width:17px!important;
  height:17px!important;
}
.card.layout-mobile .players-action-hub{
  grid-template-columns:repeat(2, minmax(0,1fr))!important;
}
.this-device-strip{
  width:max-content!important;
  max-width:100%!important;
  margin:0 auto 12px!important;
}
.this-device-toggle{
  width:auto!important;
  min-height:30px!important;
  padding:0 12px!important;
  gap:7px!important;
  font-size:11px!important;
}
.this-device-dot{
  width:8px!important;
  height:8px!important;
}
`;
}
