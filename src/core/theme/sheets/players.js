// players styles. Order is preserved by card-styles.js.
export default function() {
  return `.queue-page-head{
  justify-content:space-between!important;
}
.queue-head-transfer-btn{
  margin-inline-start:0!important;
}
.queue-page-head-actions{
  display:flex;
  align-items:center;
  gap:8px;
}
.card.layout-tablet .queue-row{
  grid-template-columns:34px 44px minmax(0,1fr) 56px!important;
  grid-template-areas:
    "idx actions meta thumb"
    "inline inline inline inline"!important;
}
.card.layout-tablet .queue-index{
  display:grid!important;
  place-items:center!important;
  width:28px!important;
  height:28px!important;
  border-radius:999px!important;
  background:rgba(255,255,255,.08)!important;
  color:color-mix(in srgb, var(--ma-accent) 72%, white 28%)!important;
  font-size:12px!important;
  font-weight:950!important;
}
.theme-light.card.layout-tablet .menu-sheet,
.theme-light.card.layout-tablet .queue-action-sheet,
.theme-light.card.layout-tablet .history-drawer{
  background:#f8fafc!important;
  color:#0f172a!important;
  -webkit-backdrop-filter:none!important;
  backdrop-filter:none!important;
}
.theme-light.card.layout-tablet .menu-body,
.theme-light.card.layout-tablet .library-shell,
.theme-light.card.layout-tablet .media-home-shell,
.theme-light.card.layout-tablet .media-results,
.theme-light.card.layout-tablet .queue-list{
  background:transparent!important;
  color:#0f172a!important;
}
.theme-light.card.layout-tablet .menu-sheet *,
.theme-light.card.layout-tablet .queue-action-sheet *,
.theme-light.card.layout-tablet .history-drawer *{
  text-shadow:none!important;
  letter-spacing:0!important;
}
.theme-light.card.layout-tablet .menu-list-item,
.theme-light.card.layout-tablet .media-entry,
.theme-light.card.layout-tablet .media-entry.grid,
.theme-light.card.layout-tablet .media-entry.list,
.theme-light.card.layout-tablet .queue-row,
.theme-light.card.layout-tablet .player-menu-card,
.theme-light.card.layout-tablet .group-player-card,
.theme-light.card.layout-tablet .settings-group,
.theme-light.card.layout-tablet .notice{
  background:#ffffff!important;
  border-color:rgba(15,23,42,.14)!important;
  color:#0f172a!important;
  box-shadow:0 10px 24px rgba(15,23,42,.08)!important;
}
.theme-light.card.layout-tablet .menu-item-title,
.theme-light.card.layout-tablet .media-entry-title,
.theme-light.card.layout-tablet .media-section-title,
.theme-light.card.layout-tablet .queue-title,
.theme-light.card.layout-tablet .player-premium-name,
.theme-light.card.layout-tablet .settings-label{
  color:#0f172a!important;
  font-family:var(--homeii-font-family)!important;
}
.theme-light.card.layout-tablet .menu-item-sub,
.theme-light.card.layout-tablet .media-entry-sub,
.theme-light.card.layout-tablet .queue-sub,
.theme-light.card.layout-tablet .player-premium-track,
.theme-light.card.layout-tablet .settings-hint{
  color:#475569!important;
}
.theme-light.card.layout-tablet .media-search-shell,
.theme-light.card.layout-tablet .media-sort-select,
.theme-light.card.layout-tablet .queue-move-select,
.theme-light.card.layout-tablet .this-device-toggle{
  background:#ffffff!important;
  color:#0f172a!important;
  border-color:rgba(15,23,42,.18)!important;
}
.theme-light.card.layout-tablet .media-layout-btn:not(.active),
.theme-light.card.layout-tablet .library-nav-btn:not(.active),
.theme-light.card.layout-tablet .players-action-chip{
  background:#ffffff!important;
  color:#334155!important;
  border-color:rgba(15,23,42,.14)!important;
}
.theme-light.card.layout-tablet .queue-index{
  background:#f1f5f9!important;
  color:#0f172a!important;
}
.players-action-bar{
  width:min(100%, 760px)!important;
  margin:0 auto 18px!important;
  display:block!important;
  align-items:center!important;
  justify-content:center!important;
  gap:10px!important;
}
.players-action-shell{
  width:100%!important;
  max-width:100%!important;
  margin:0!important;
  padding:8px!important;
  border-radius:22px!important;
  border:1px solid rgba(255,255,255,.13)!important;
  background:linear-gradient(145deg, rgba(255,255,255,.075), rgba(255,255,255,.025))!important;
  box-shadow:0 14px 30px rgba(0,0,0,.14), inset 0 1px 0 rgba(255,255,255,.08)!important;
  backdrop-filter:blur(18px)!important;
  -webkit-backdrop-filter:blur(18px)!important;
}
.players-action-shell .players-action-hub{
  width:100%!important;
  margin:0!important;
  display:grid!important;
  grid-template-columns:repeat(4, minmax(0, 1fr))!important;
  align-items:center!important;
  justify-content:center!important;
  gap:8px!important;
}
.players-action-shell .players-action-chip{
  position:relative!important;
  width:100%!important;
  height:60px!important;
  min-width:0!important;
  min-height:60px!important;
  border-radius:16px!important;
  padding:8px 5px!important;
  display:grid!important;
  grid-template-rows:24px 1fr!important;
  place-items:center!important;
  gap:3px!important;
  color:rgba(255,255,255,.86)!important;
  background:rgba(255,255,255,.07)!important;
  border:1px solid rgba(255,255,255,.10)!important;
  box-shadow:none!important;
  font-size:11px!important;
}
.players-action-shell .players-action-chip:hover,
.players-action-shell .players-action-chip:focus-visible{
  background:rgba(255,255,255,.12)!important;
  border-color:rgba(255,255,255,.18)!important;
}
.players-action-shell .players-action-label{
  display:block!important;
  max-width:100%!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
  white-space:nowrap!important;
  font-size:10.5px!important;
  line-height:1.05!important;
  font-weight:850!important;
}
.players-action-shell .players-action-badge{
  position:absolute!important;
  top:-5px!important;
  inset-inline-end:-5px!important;
  min-width:22px!important;
  height:22px!important;
  padding:0 6px!important;
  border-radius:999px!important;
  display:grid!important;
  place-items:center!important;
  color:#10141d!important;
  background:var(--ma-accent)!important;
  border:2px solid rgba(12,16,24,.84)!important;
  font-size:10px!important;
  font-weight:950!important;
  line-height:1!important;
}
.players-action-shell .players-action-dot{
  position:absolute!important;
  top:-5px!important;
  inset-inline-end:-5px!important;
  bottom:auto!important;
  width:17px!important;
  height:17px!important;
  border-radius:999px!important;
  background:#9ca3af!important;
  border:2px solid rgba(12,16,24,.84)!important;
  box-shadow:0 0 0 2px rgba(156,163,175,.12)!important;
}
.players-action-shell .players-action-chip.this-device.connected .players-action-dot{
  background:#36d67a!important;
  box-shadow:0 0 0 2px rgba(54,214,122,.18)!important;
}
.players-action-shell .players-action-chip.this-device.connecting .players-action-dot,
.players-action-shell .players-action-chip.this-device.disconnecting .players-action-dot{
  background:#f5c542!important;
  box-shadow:0 0 0 2px rgba(245,197,66,.18)!important;
}
.players-action-icon{
  flex:0 0 auto!important;
  width:auto!important;
  height:auto!important;
  display:grid!important;
  place-items:center!important;
  border-radius:0!important;
  background:transparent!important;
  color:color-mix(in srgb, var(--ma-accent) 62%, white 38%)!important;
}
.players-action-icon .ui-ic{
  width:19px!important;
  height:19px!important;
}
.players-action-shell .players-action-chip.danger{
  color:#ffd7d7!important;
  background:rgba(255,85,95,.10)!important;
  border-color:rgba(255,105,115,.20)!important;
}
.players-action-shell .players-action-chip.danger .players-action-icon{
  color:#ffc3c3!important;
  background:transparent!important;
}
.players-action-stop{
  height:52px!important;
  min-height:52px!important;
  border-radius:999px!important;
  border:1px solid rgba(255,105,115,.28)!important;
  background:linear-gradient(145deg, rgba(255,85,95,.18), rgba(255,85,95,.08))!important;
  color:#ffd7d7!important;
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  gap:8px!important;
  padding:0 16px!important;
  font:inherit!important;
  font-size:12px!important;
  font-weight:950!important;
  white-space:nowrap!important;
  cursor:pointer!important;
  box-shadow:0 14px 30px rgba(0,0,0,.14), inset 0 1px 0 rgba(255,255,255,.08)!important;
  backdrop-filter:blur(18px)!important;
  -webkit-backdrop-filter:blur(18px)!important;
}
.players-action-stop:hover,
.players-action-stop:focus-visible{
  background:linear-gradient(145deg, rgba(255,85,95,.25), rgba(255,85,95,.12))!important;
  border-color:rgba(255,130,138,.38)!important;
}
.players-action-stop-icon{
  width:30px!important;
  height:30px!important;
  border-radius:999px!important;
  display:grid!important;
  place-items:center!important;
  background:rgba(255,85,95,.16)!important;
  color:#ffc3c3!important;
}
.players-action-stop-icon .ui-ic{
  width:15px!important;
  height:15px!important;
}
.card.layout-mobile .players-action-bar{
  width:100%!important;
  max-width:430px!important;
  flex-wrap:wrap!important;
  gap:8px!important;
}
.card.layout-mobile .players-action-shell .players-action-hub{
  display:grid!important;
  grid-template-columns:repeat(4, minmax(0, 1fr))!important;
  gap:6px!important;
}
.card.layout-mobile .players-action-shell{
  width:100%!important;
  max-width:100%!important;
  padding:6px!important;
  border-radius:20px!important;
}
.card.layout-mobile .players-action-shell .players-action-chip{
  height:56px!important;
  min-height:56px!important;
  padding:7px 3px!important;
}
.card.layout-mobile .players-action-shell .players-action-label{
  font-size:9.5px!important;
}
.theme-light .players-action-shell,
.theme-light.card.layout-tablet .players-action-shell{
  background:rgba(255,255,255,.88)!important;
  border-color:rgba(15,23,42,.12)!important;
  box-shadow:0 14px 30px rgba(15,23,42,.09), inset 0 1px 0 rgba(255,255,255,.78)!important;
}
.theme-light .players-action-shell .players-action-chip,
.theme-light.card.layout-tablet .players-action-shell .players-action-chip{
  color:#334155!important;
  background:rgba(15,23,42,.05)!important;
  border-color:rgba(15,23,42,.10)!important;
}
.theme-light .players-action-shell .players-action-chip:hover,
.theme-light.card.layout-tablet .players-action-shell .players-action-chip:hover{
  background:#f8fafc!important;
  border-color:rgba(15,23,42,.10)!important;
}
.theme-light .players-action-icon,
.theme-light.card.layout-tablet .players-action-icon{
  color:#0f172a!important;
}
.theme-light .players-action-shell .players-action-badge,
.theme-light.card.layout-tablet .players-action-shell .players-action-badge{
  border-color:rgba(255,255,255,.9)!important;
}
.theme-light .players-action-shell .players-action-dot,
.theme-light.card.layout-tablet .players-action-shell .players-action-dot{
  border-color:rgba(255,255,255,.9)!important;
}
.theme-light .players-action-shell .players-action-chip.danger,
.theme-light.card.layout-tablet .players-action-shell .players-action-chip.danger{
  color:#b4232b!important;
  background:#fff1f2!important;
  border-color:rgba(180,35,43,.12)!important;
}
.theme-light .players-action-stop,
.theme-light.card.layout-tablet .players-action-stop{
  color:#b4232b!important;
  background:#fff1f2!important;
  border-color:rgba(180,35,43,.16)!important;
  box-shadow:0 14px 30px rgba(15,23,42,.08), inset 0 1px 0 rgba(255,255,255,.78)!important;
}
.theme-light .players-action-stop-icon,
.theme-light.card.layout-tablet .players-action-stop-icon{
  color:#b4232b!important;
  background:rgba(180,35,43,.10)!important;
}

.card.layout-mobile .menu-backdrop.action-fullscreen-open{
  padding:0!important;
  background:rgba(5,7,12,.72)!important;
  z-index:80!important;
}
.card.layout-mobile:has(.menu-backdrop.action-fullscreen-open.open) > .home-shortcut-fab{
  display:none!important;
}
.card.layout-mobile .menu-backdrop.action-fullscreen-open::before{
  opacity:.68!important;
  filter:blur(46px) saturate(1.2) brightness(.78)!important;
}
.card.layout-mobile .menu-backdrop.action-fullscreen-open .menu-sheet{
  width:100%!important;
  max-width:100%!important;
  height:100%!important;
  max-height:100%!important;
  margin:0!important;
  border-radius:0!important;
  box-shadow:none!important;
}
.card.layout-mobile .menu-backdrop.action-fullscreen-open .menu-head{
  min-height:62px;
  background:rgba(8,10,16,.54);
  border-bottom-color:rgba(255,255,255,.10);
  backdrop-filter:blur(18px);
  -webkit-backdrop-filter:blur(18px);
}
.card.layout-mobile .menu-backdrop.action-fullscreen-open .menu-title{
  max-width:min(620px, calc(100% - 132px));
}
.card.layout-mobile .menu-backdrop.action-fullscreen-open .menu-title-text{
  display:inline-block;
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.card.layout-mobile .menu-backdrop.action-fullscreen-open .menu-sheet::after{
  background:
    radial-gradient(circle at 14% 12%, rgba(var(--dynamic-accent-rgb,245 166 35) / .16), transparent 34%),
    radial-gradient(circle at 84% 4%, rgba(91,141,255,.14), transparent 28%),
    linear-gradient(180deg, rgba(7,9,15,.68), rgba(8,10,16,.96))!important;
}
.theme-light.card.layout-mobile .menu-backdrop.action-fullscreen-open .menu-sheet::after{
  background:
    radial-gradient(circle at 14% 12%, rgba(var(--dynamic-accent-rgb,245 166 35) / .16), transparent 34%),
    radial-gradient(circle at 84% 4%, rgba(80,127,220,.13), transparent 28%),
    linear-gradient(180deg, rgba(248,250,253,.80), rgba(234,240,248,.98))!important;
}
.card.layout-mobile .menu-backdrop.action-fullscreen-open .menu-body{
  padding:clamp(12px, 3vw, 20px) clamp(14px, 4vw, 24px) max(24px, env(safe-area-inset-bottom))!important;
}
.card.layout-mobile .menu-backdrop.action-fullscreen-open .menu-body.library-mode{
  padding:0!important;
}
.card.layout-mobile .menu-backdrop.action-fullscreen-open .menu-body.sheet-artist-detail{
  padding:clamp(10px, 3vw, 18px) clamp(12px, 4vw, 22px) max(22px, env(safe-area-inset-bottom))!important;
}

.card.layout-tablet .menu-backdrop.library-fullscreen-open{
  padding:0!important;
  background:rgba(5,7,12,.72)!important;
  z-index:80!important;
}
.card.layout-tablet:has(.menu-backdrop.library-fullscreen-open.open) > .home-shortcut-fab{
  display:none!important;
}
.card.layout-tablet .menu-backdrop.library-fullscreen-open::before{
  opacity:.66!important;
  filter:blur(46px) saturate(1.2) brightness(.78)!important;
}
.card.layout-tablet .menu-backdrop.library-fullscreen-open .menu-sheet.sheet-library,
.card.layout-tablet .menu-backdrop.library-fullscreen-open .menu-sheet.sheet-search,
.card.layout-tablet .menu-backdrop.library-fullscreen-open .menu-sheet.sheet-artist-detail{
  width:100%!important;
  max-width:100%!important;
  height:100%!important;
  max-height:100%!important;
  margin:0!important;
  border-radius:0!important;
  box-shadow:none!important;
}
.card.layout-tablet .menu-backdrop.library-fullscreen-open .menu-head{
  min-height:62px;
  background:rgba(8,10,16,.54);
  border-bottom-color:rgba(255,255,255,.10);
  backdrop-filter:blur(18px);
}
.card.layout-tablet .menu-backdrop.library-fullscreen-open .menu-title{
  max-width:min(620px, calc(100% - 132px));
}
.card.layout-tablet .menu-backdrop.library-fullscreen-open .menu-title-text{
  display:inline-block;
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.card.layout-tablet .menu-backdrop.library-fullscreen-open .menu-sheet.sheet-library::after,
.card.layout-tablet .menu-backdrop.library-fullscreen-open .menu-sheet.sheet-search::after,
.card.layout-tablet .menu-backdrop.library-fullscreen-open .menu-sheet.sheet-artist-detail::after{
  background:
    radial-gradient(circle at 14% 12%, rgba(var(--dynamic-accent-rgb,245 166 35) / .18), transparent 34%),
    radial-gradient(circle at 84% 4%, rgba(91,141,255,.16), transparent 28%),
    linear-gradient(180deg, rgba(7,9,15,.68), rgba(8,10,16,.96))!important;
}
`;
}
