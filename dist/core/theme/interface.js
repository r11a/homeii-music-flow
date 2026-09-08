import heeboUrl from "./heebo.ttf?inline";

let fontPromise;

export function ensureInterfaceFont() {
  if (typeof FontFace === "undefined" || !globalThis.document?.fonts) return;
  if (!fontPromise) {
    const face = new FontFace("HOMEii Heebo", `url(${heeboUrl})`, { weight: "100 900", display: "swap" });
    document.fonts.add(face);
    fontPromise = face.load().catch(() => { document.fonts.delete(face); fontPromise = null; });
  }
  return fontPromise;
}

// Shared by the card and editor; colors continue to follow the selected theme.
export const interfaceStyles = `
  :host, .card {
    --homeii-font-family:"HOMEii Heebo",Heebo,Arial,sans-serif;
    --primary-font-family:var(--homeii-font-family);
    --paper-font-common-base_-_font-family:var(--homeii-font-family);
    --paper-font-body1_-_font-family:var(--homeii-font-family);
    font-family:var(--homeii-font-family);
    --homeii-surface:rgba(16,17,19,calc(var(--ma-popup-opacity,.9) * .8));
    --homeii-surface-border:rgba(255,255,255,.12);
    --homeii-surface-text:#f4f5f6;
    --homeii-surface-muted:#b8bdc5;
    --homeii-scrim:rgba(0,0,0,.16);
  }
  :host(.theme-light), .theme-light {
    --homeii-surface:rgba(250,251,252,calc(var(--ma-popup-opacity,.9) * .86));
    --homeii-surface-border:rgba(25,31,40,.12);
    --homeii-surface-text:#20242b;
    --homeii-surface-muted:#56606d;
    --homeii-scrim:rgba(245,247,250,.12);
  }
  .card #mobileMenu.menu-backdrop[class] .menu-sheet[class],
  .card .menu-sheet[class], .card .queue-action-sheet[class],
  #groupModal .modal, #playerModal .modal,
  .card :is(.ctx-menu,.lyrics-sheet,.history-drawer,.surprise-popup-card,.tablet-volume-popup,.smart-voice-sheet,.voice-assistant-dialog,.artist-info-dialog,.control-room-shell,.control-room-tray,.toast) {
    background:var(--homeii-surface)!important;
    border-color:var(--homeii-surface-border)!important;
    color:var(--homeii-surface-text)!important;
    --ma-text-1:var(--homeii-surface-text);
    --ma-text-2:var(--homeii-surface-muted);
    --ma-text-3:var(--homeii-surface-muted);
    backdrop-filter:blur(40px) saturate(.85)!important;
    -webkit-backdrop-filter:blur(40px) saturate(.85)!important;
  }
  .card #mobileMenu.menu-backdrop[class] .menu-sheet[class]::before,
  .card #mobileMenu.menu-backdrop[class] .menu-sheet[class]::after,
  .card :is(.lyrics-sheet,.history-drawer)::before,
  .card :is(.lyrics-sheet,.history-drawer)::after { background:none!important; }
  .card .control-room-scene :is(.control-room-scene-bg,.control-room-scene-glow) { opacity:.06!important; }
  .card #mobileMenu.menu-backdrop[class],
  .card :is(.modal-backdrop,.queue-action-backdrop,.control-room-backdrop) {
    background:var(--homeii-scrim)!important;
  }
  .card #mobileMenu.menu-backdrop[class]::after { background:none!important; }
  .card .queue-action-sheet[class]::before, .card .queue-action-sheet[class]::after { background:none!important; }
  .card #mobileMenu.menu-backdrop[class]::before { opacity:.12!important; filter:blur(28px) saturate(.6)!important; }
  .card #mobileMenu .menu-head { background:transparent!important; }
  .card, .editor-shell, button, input, textarea, select {
    font-family:var(--homeii-font-family);
  }
  .card :is(button,input,textarea,select):focus-visible {
    outline:2px solid var(--ma-accent,var(--primary-color));
    outline-offset:3px;
  }
  .card .menu-title-text { font-weight:650; letter-spacing:0; }
  #mobileMenu .menu-title { width:100%; min-width:0; max-width:100%; }
  #mobileMenu .menu-title-main { width:100%; min-width:0; }
  #mobileMenu .menu-title-text { white-space:normal; overflow-wrap:anywhere; text-overflow:clip; line-height:1.3; }
  #mobileMenu .media-detail-title { white-space:normal; overflow-wrap:anywhere; text-overflow:clip; }
  .card :is(.menu-title-brand,.history-drawer-brand,.queue-action-brand,.screensaver-brand) { display:none; }
  .card[class]:not(.layout-tablet) > .mobile-brand-signature {
    width:112px; min-height:0; max-height:none; inset-block-start:8px;
    opacity:.58; transform:translateX(-50%); filter:none; pointer-events:none;
  }
  .card img[data-homeii-brand-logo] { object-fit:contain!important; height:auto!important; max-width:100%; aspect-ratio:auto; transform:none!important; }
  .card .mobile-brand-signature .mobile-brand-logo { width:100%; height:auto; max-height:none; }
  .card[class].layout-tablet > .tablet-brand-watermark {
    inset-block-start:10px; inset-block-end:auto; inset-inline-start:50%!important; inset-inline-end:auto!important;
    width:76px; height:auto; transform:translateX(-50%); opacity:.48; filter:none; mix-blend-mode:normal;
  }
  .card[class].layout-tablet:is(.height-tight,.size-xs,.size-sm) > .tablet-brand-watermark { display:none; }
  #mobileMenu :is(.media-detail-play-btn,.media-more-btn,.media-layout-btn,.menu-close,.menu-back,.menu-aux-btn) {
    min-width:44px; min-height:44px; border-radius:14px; box-sizing:border-box;
    border:1px solid var(--ma-border,#ffffff24); box-shadow:none;
  }
  #mobileMenu :is(.media-detail-play-btn,.media-more-btn,.media-layout-btn,.menu-close,.menu-back,.menu-aux-btn) .ui-ic { width:20px; height:20px; }
  #mobileMenu .menu-head > button { width:44px; height:44px; min-width:44px; min-height:44px; padding:0; border-radius:14px; display:grid; place-items:center; }
  #mobileMenu .menu-head > button[hidden] { display:none; }
  #mobileMenu .menu-head > button .ui-ic { width:20px; height:20px; }
  .card .library-nav-btn { border-radius:12px; box-shadow:none; font-weight:550; }
  .card .menu-backdrop.discovery-open::before { opacity:0!important; }
  .card .menu-backdrop.discovery-open .menu-sheet.sheet-discovery::after { background:var(--ma-panel,#20242b)!important; }
  .card .menu-backdrop.discovery-open .menu-head { background:transparent; }
  #mobileMenu .discovery-catalog { display:flex; flex-direction:column; gap:24px; height:auto; min-height:0; width:100%; padding-block:12px 24px; }
  #mobileMenu .menu-body.sheet-discovery { min-height:0; min-width:0; scrollbar-gutter:stable; overflow-x:hidden!important; }
  #mobileMenu .discovery-catalog-toolbar { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr)); align-items:end; gap:12px; }
  #mobileMenu .discovery-category-select { min-width:0; gap:8px; }
  #mobileMenu .discovery-category-select > span { font-size:12px; font-weight:550; text-transform:none; color:var(--homeii-surface-muted); }
  #mobileMenu .discovery-category-select select { box-sizing:border-box; min-width:0; max-width:100%; width:100%; min-height:48px; border:1px solid var(--homeii-surface-border); border-radius:14px; padding:10px 14px; font:inherit; font-size:14px; font-weight:500; color:var(--homeii-surface-text); background:color-mix(in srgb,var(--homeii-surface-text) 5%,transparent); box-shadow:none; }
  #mobileMenu .discovery-category-select option { background:var(--ma-panel,#20242b); color:var(--homeii-surface-text); }
  #mobileMenu .discovery-catalog .discovery-player-focus { box-sizing:border-box; width:100%; max-width:none; min-height:68px; grid-template-columns:42px minmax(0,1fr) auto; grid-template-rows:auto auto; gap:2px 12px; border-radius:14px; padding:12px; border-color:var(--homeii-surface-border); box-shadow:none; background:color-mix(in srgb,var(--homeii-surface-text) 4%,transparent); font:inherit; transform:none; }
  #mobileMenu .discovery-catalog > * { flex-shrink:0; }
  #mobileMenu .discovery-catalog .discovery-player-focus { height:auto; min-height:88px; }
  #mobileMenu .discovery-player-kicker { grid-column:2; grid-row:1; font-size:11px; font-weight:500; color:var(--homeii-surface-muted); }
  #mobileMenu .discovery-player-art { grid-column:1; grid-row:1 / 3; width:42px; height:42px; border-radius:10px; }
  #mobileMenu .discovery-player-copy { grid-column:2; grid-row:2; min-width:0; }
  #mobileMenu .discovery-player-name { font-size:14px; font-weight:600; }
  #mobileMenu .discovery-player-state { font-size:12px; font-weight:400; }
  #mobileMenu .discovery-player-badge { position:static; grid-column:3; grid-row:1 / 3; align-self:center; transform:none; }
  #mobileMenu .discovery-catalog-heading { display:flex; align-items:center; gap:12px; }
  #mobileMenu .discovery-catalog-heading h2 { margin:0; font-size:24px; font-weight:650; line-height:1.35; overflow-wrap:anywhere; }
  #mobileMenu .discovery-catalog-heading p { margin:4px 0 0; color:var(--ma-text-2); font-size:13px; }
  #mobileMenu .discovery-catalog-heading h2 .ui-ic { width:24px; height:24px; vertical-align:middle; }
  #mobileMenu .discovery-result-section { min-width:0; }
  #mobileMenu .discovery-result-section h3 { font-size:17px; font-weight:600; margin:0 0 14px; }
  #mobileMenu .discovery-catalog-folders { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:12px; }
  #mobileMenu .discovery-catalog-folder { display:flex; align-items:center; gap:12px; padding:16px; min-height:64px; border:1px solid var(--ma-border,#ffffff24); border-radius:14px; color:var(--ma-text-1); background:transparent; text-align:start; font:inherit; cursor:pointer; }
  #mobileMenu .discovery-catalog-folder span { flex:1; min-width:0; overflow-wrap:anywhere; }
  #mobileMenu .discovery-catalog-folder .ui-ic { width:20px; height:20px; flex:none; }
  #mobileMenu .discovery-catalog-folder .ui-ic:last-child { transform:rotate(180deg); width:16px; }
  .rtl #mobileMenu .discovery-catalog-folder .ui-ic:last-child { transform:none; }
  #mobileMenu .discovery-catalog .chip-btn { min-width:44px; min-height:44px; border-radius:14px; border:1px solid var(--ma-border,#ffffff24); background:var(--ma-panel,#20242b); color:var(--ma-text-1); box-shadow:none; }
  @media(max-width:520px) { #mobileMenu .discovery-catalog-toolbar { grid-template-columns:minmax(0,1fr); } }
  :host(:not(.action-labels)) :is(.players-action-label,.queue-head-transfer-label) { display:none; }
  .card .library-nav-btn.active { background:color-mix(in srgb,var(--ma-accent) 14%,transparent); }
  .card .media-entry { box-shadow:none; border-color:transparent; }
  .card .media-entry.list {
    border-radius:12px; background:transparent; border-bottom:1px solid color-mix(in srgb,var(--ma-text-1) 9%,transparent);
  }
  .card .media-entry.grid { border-radius:16px; background:transparent; }
  .card .media-entry.grid .menu-thumb { border-radius:12px; box-shadow:0 4px 14px #0002; }
  .card .media-entry-title { font-weight:600; line-height:1.45; }
  .card .media-entry-subtitle { font-weight:400; line-height:1.5; }
  .card .queue-playback-options { display:flex; gap:8px; padding:4px 0 12px; }
  .card .queue-playback-options .chip-btn { display:inline-flex; align-items:center; justify-content:center; min-width:44px; min-height:44px; gap:8px; border:1px solid var(--ma-border,#ffffff24); border-radius:14px; background:var(--ma-panel,#20242b); color:var(--ma-text-1,#fff); }
  .card .library-nav-btn { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; }
  .card .library-nav-btn > span { font-size:11px; line-height:1.2; }
  .card .queue-playback-options .chip-btn[aria-pressed="true"] { color:var(--ma-accent); border-color:currentColor; }
  .card .queue-playback-options .chip-btn[aria-busy="true"] { opacity:.5; cursor:progress; }
  .card :is(.action-hub,.queue-settings-form) { width:100%; max-width:860px; margin-inline:auto; box-sizing:border-box; color:var(--homeii-surface-text); }
  .card .action-hub { max-width:520px; padding:8px 4px; }
  .card .action-hub-section { margin:0; padding:20px 4px; border-bottom:1px solid var(--homeii-surface-border); }
  .card .action-hub-section:first-child { padding-top:0; }
  .card .action-hub-section:last-child { border-bottom:0; padding-bottom:0; }
  .card .action-hub-section h3 { display:flex; align-items:center; gap:10px; margin:0 0 14px; font-size:13px; line-height:1.5; font-weight:500; color:var(--homeii-surface-muted); }
  .card .action-hub-section h3 svg { width:22px; height:22px; flex:0 0 22px; }
  .card .action-hub-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; }
  .card .action-hub .action-tile { display:flex; align-items:center; justify-content:center; min-width:0; min-height:60px; height:auto; padding:8px; border:0; border-radius:16px; background:transparent; box-shadow:none; color:var(--homeii-surface-text); transition:background .16s; }
  .card .action-hub .action-tile .menu-item-main { display:flex; align-items:center; gap:12px; width:100%; min-width:0; }
  .card .action-hub .action-tile .menu-item-ico { display:grid; place-items:center; flex:0 0 48px; width:48px; height:48px; min-width:48px; padding:0; border:1px solid var(--homeii-surface-border); border-radius:50%; background:color-mix(in srgb,var(--homeii-surface-text) 5%,transparent); color:inherit; box-shadow:inset 0 1px 0 rgb(255 255 255 / 4%); }
  .card .action-hub .menu-item-ico svg { width:24px; height:24px; }
  .card .action-hub .menu-item-title { display:block; font-size:14px; line-height:1.5; font-weight:600; white-space:normal; overflow-wrap:anywhere; }
  .card .action-hub .menu-item-sub { display:block; margin-top:3px; font-size:12px; line-height:1.5; color:var(--homeii-surface-muted); white-space:normal; }
  .card .action-hub.icons-only .menu-item-main { justify-content:center; }
  .card .action-hub .action-tile { backdrop-filter:none!important; -webkit-backdrop-filter:none!important; }
  .card .action-hub.icons-only .action-tile { height:64px; min-height:64px; }
  .card .action-hub.icons-only .menu-item-main { padding:0; min-height:0; height:auto; }
  .card .action-hub.icons-only .menu-item-main > span:last-child:not(.menu-item-ico) { display:none; }
  .card .action-hub.with-labels .action-hub-grid { grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px 8px; }
  .card .action-hub.with-labels .menu-item-main { flex-direction:column; gap:10px; padding:0; align-items:center; text-align:center; }
  .card .action-hub.with-labels .menu-item-sub { display:none; }
  .card .action-hub.with-labels .menu-item-title { font-size:13px; line-height:1.4; font-weight:500; }
  .card .action-hub.with-labels .action-tile { align-items:flex-start; min-height:94px; }
  .card .action-hub.with-labels .menu-item-main > span:last-child { width:100%; }
  .card :is(.action-hub,.queue-settings-form) button:focus-visible { outline:2px solid var(--ma-accent,#92b7c5); outline-offset:3px; }
  .card .action-hub-note { margin:0 0 24px; color:var(--homeii-surface-muted); font-size:13px; line-height:1.7; }
  .card .queue-settings-form fieldset { border:0; padding:0; margin:0; min-width:0; }
  .card .queue-settings-fields { display:grid; gap:16px; padding:18px; border:1px solid var(--homeii-surface-border); border-radius:20px; background:color-mix(in srgb,var(--homeii-surface-text) 3%,transparent); }
  .card .queue-setting-field { display:grid; gap:8px; min-width:0; font-size:14px; line-height:1.5; }
  .card .queue-setting-field[hidden] { display:none; }
  .card .queue-setting-field.is-switch { display:flex; align-items:center; justify-content:space-between; gap:16px; }
  .card .queue-setting-field :is(select,input[type="number"]) { box-sizing:border-box; width:100%; min-width:0; min-height:46px; border:1px solid var(--homeii-surface-border); border-radius:13px; background:color-mix(in srgb,var(--homeii-surface-text) 5%,transparent); color:var(--homeii-surface-text); font:inherit; padding:10px 12px; }
  .card .queue-setting-field option { background:var(--ha-card-background,var(--card-background-color,#202124)); color:var(--primary-text-color,#eee); }
  .card .queue-setting-field input[role="switch"] { appearance:none; position:relative; flex:0 0 44px; width:44px; height:26px; margin:0; border:1px solid var(--homeii-surface-border); border-radius:20px; background:color-mix(in srgb,var(--homeii-surface-text) 16%,transparent); cursor:pointer; }
  .card .queue-setting-field input[role="switch"]::after { content:""; position:absolute; top:3px; left:3px; width:18px; height:18px; background:var(--homeii-surface-text); border-radius:50%; transition:transform .15s; }
  .card .queue-setting-field input[role="switch"]:checked { background:var(--ma-accent,#6695aa); }
  .card .queue-setting-field input[role="switch"]:checked::after { transform:translateX(18px); }
  .card .queue-settings-footer { display:flex; flex-wrap:wrap; gap:12px; align-items:center; padding-block:8px 20px; font-size:13px; line-height:1.5; }
  .card .queue-settings-footer .action-btn { display:inline-flex; gap:8px; align-items:center; justify-content:center; min-height:46px; padding:10px 18px; border-radius:14px; }
  .card .queue-settings-footer svg { width:20px; height:20px; }
  .card .queue-settings-form :disabled { opacity:.5; cursor:default; }
  .card .queue-action-sheet:has(.media-action-layout) { width:min(560px,calc(100% - 24px)); max-width:560px; max-height:min(85dvh,760px); overflow:auto; padding:20px; border-radius:26px; box-sizing:border-box; }
  .card #mobileQueueActionModal.open { align-items:center!important; padding:12px!important; box-sizing:border-box; }
  .card #mobileQueueActionSheet:has(.media-action-layout) { width:min(560px,100%)!important; max-width:560px!important; height:auto!important; min-height:0!important; max-height:calc(100dvh - 48px)!important; border-radius:26px!important; margin:auto!important; box-shadow:0 24px 70px rgb(0 0 0 / 35%)!important; }
  .card .media-action-heading { display:grid; grid-template-columns:52px minmax(0,1fr) 44px; align-items:center; gap:12px; margin-bottom:20px; }
  .card .media-action-art { width:52px; height:52px; border-radius:12px; overflow:hidden; display:grid; place-items:center; background:color-mix(in srgb,var(--homeii-surface-text) 6%,transparent); }
  .card .media-action-art :is(img,svg) { width:100%; height:100%; object-fit:cover; }
  .card .media-action-art > svg { width:26px; height:26px; }
  .card .media-action-copy { min-width:0; }
  .card .media-action-heading .queue-action-title { font-size:16px; font-weight:600; line-height:1.5; white-space:normal; overflow-wrap:anywhere; max-height:none; margin:0; }
  .card .media-action-heading .queue-action-player { color:var(--homeii-surface-muted); font-size:12px; margin:0 0 3px; }
  .card .media-action-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; }
  .card .media-action-layout .queue-action-item { display:flex; align-items:center; justify-content:center; flex-direction:column; gap:8px; width:100%; min-width:0; min-height:60px; margin:0; padding:12px; border:1px solid var(--homeii-surface-border); border-radius:16px; background:color-mix(in srgb,var(--homeii-surface-text) 4%,transparent); color:var(--homeii-surface-text); font-size:13px; line-height:1.5; font-weight:500; text-align:center; }
  .card .media-action-layout .queue-action-item svg { width:25px; height:25px; flex:0 0 25px; }
  .card .media-action-heading .queue-action-item { width:44px; min-height:44px; height:44px; padding:10px; }
  .card .media-action-heading .queue-action-item span { display:none; }
  .card .media-action-layout .queue-action-item:disabled { opacity:.45; cursor:progress; }
  .card .media-action-layout .queue-action-item:focus-visible { outline:2px solid var(--ma-accent,#92b7c5); outline-offset:2px; }
  .card .media-action-secondary { margin-top:18px; padding-top:14px; border-top:1px solid var(--homeii-surface-border); }
  .card .media-action-secondary p { margin:0 0 10px; color:var(--homeii-surface-muted); font-size:12px; }
  .card .media-action-secondary .media-action-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .card .media-action-layout.icons-only > .media-action-grid { grid-template-columns:repeat(auto-fit,minmax(46px,1fr)); gap:8px; padding-block:4px; }
  .card .media-action-layout.icons-only .queue-action-item { min-height:48px; padding:10px; border-radius:50%; aspect-ratio:1; width:48px; justify-self:center; background:transparent; border-color:var(--homeii-surface-border); color:var(--homeii-surface-text); }
  .card .media-action-layout [data-media-popup="play"] { background:var(--homeii-surface-text)!important; color:var(--homeii-surface-bg,#141518)!important; border-color:transparent!important; }
  .theme-light.card .media-action-layout [data-media-popup="play"] { color:#fff!important; }
  .card .media-action-layout .media-action-secondary .media-action-grid { display:flex; justify-content:flex-start; gap:12px; }
  .card .media-action-layout .media-action-secondary .queue-action-item { color:var(--homeii-surface-muted); }
  .card .media-action-layout .media-action-heading .queue-action-item { width:36px; min-height:36px; padding:8px; border:0; border-radius:50%; background:color-mix(in srgb,var(--homeii-surface-text) 5%,transparent); color:var(--homeii-surface-muted); }
  .card .media-action-layout .queue-move-control { margin-bottom:16px; }
  .card .ctx-menu { padding:8px; border-radius:20px; }
  .card .ctx-menu .ctx-item { width:100%; min-height:44px; border:0; background:transparent; color:var(--homeii-surface-text); font:inherit; font-size:13px; font-weight:500; }
  .card .ctx-menu .ctx-item svg { width:22px; height:22px; flex:0 0 22px; }
  .card .player-volume-unavailable { color:var(--homeii-surface-muted); font-size:12px; line-height:1.6; padding:8px 12px; }
  @media(hover:hover) { .card .action-hub .action-tile:hover { background:color-mix(in srgb,var(--homeii-surface-text) 9%,transparent); border-color:color-mix(in srgb,var(--homeii-surface-text) 24%,transparent); } }
  @media(max-width:440px) { .card .action-hub.with-labels .action-hub-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .card .action-hub .action-tile { padding:6px; min-height:60px; } .card .queue-settings-fields { padding:14px; } }
  .card :is(.media-more-btn,.library-nav-btn,.media-layout-btn) { min-width:40px; min-height:40px; }
  .card .toast-wrap { max-width:calc(100% - 32px); }
  .card .toast {
    border-radius:14px; padding:12px 16px; font-size:14px; font-weight:500; line-height:1.5;
    background:var(--ma-panel,#20242b); color:var(--ma-text-1,#fff);
    border:1px solid var(--ma-border,#ffffff24); box-shadow:0 8px 26px #0003;
    max-width:min(420px,100%); text-align:start; overflow-wrap:anywhere;
  }
  .card .toast-icon { flex:0 0 24px; text-align:center; font-weight:700; }
  .card .toast.success .toast-icon { color:#48bd8b; }
  .card .toast.error .toast-icon { color:#ef7777; }
  .card .toast-ack { min-height:36px; min-width:44px; font:inherit; }
  @media(hover:hover) {
    .card .media-entry:hover { background:color-mix(in srgb,var(--ma-text-1) 6%,transparent); }
  }
  @media(prefers-reduced-motion:reduce) {
    .card *, .card *::before, .card *::after {
      animation-duration:.01ms!important; animation-iteration-count:1!important;
      transition-duration:.01ms!important; scroll-behavior:auto!important;
    }
  }
  .card .queue-playback-options { display:flex; align-items:center; justify-content:center; gap:12px; padding:10px; }
  .card .queue-drag-handle { touch-action:none; cursor:grab; min-width:36px; min-height:48px; padding:0; display:grid; place-items:center; color:var(--homeii-surface-muted); background:transparent; border:0; }
  .card .queue-dragging { opacity:.55; }
  .card .queue-drop-target { outline:2px solid var(--homeii-surface-text); outline-offset:-2px; border-radius:16px; }
  .card .queue-playback-options .chip-btn { display:inline-flex!important; align-items:center; justify-content:center; min-width:48px; min-height:48px; gap:8px; border:1px solid var(--homeii-surface-border); border-radius:16px; background:transparent; color:var(--homeii-surface-text); }
  .card .queue-playback-options .chip-btn svg { display:block!important; width:27px!important; height:27px!important; flex:0 0 27px; opacity:1!important; }
  .card .group-setup-intro { padding:4px 0 12px; text-align:start; }
  .card .group-change-row[hidden] { display:none!important; }
  .card.rtl .group-setup-intro,.card.rtl .group-members-summary { direction:rtl; text-align:right; }
  .card #mobileMenu .group-player-card { min-width:0!important; width:100%!important; max-width:100%!important; box-sizing:border-box; }
  .card #mobileMenu .group-player-card .player-premium-copy { min-width:0!important; }
  .card #mobileMenu .players-premium-grid:has(.group-player-card) { width:100%!important; max-width:100%!important; min-width:0!important; grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))!important; gap:12px!important; margin:12px 0!important; box-sizing:border-box; }
  .card #mobileMenu .group-actions { width:100%!important; max-width:100%!important; box-sizing:border-box; justify-content:center; }
  .card .group-setup-intro h3 { margin:0 0 8px; font-size:22px; font-weight:550; }
  .card .group-setup-intro p,.card .group-members-summary { margin:0 0 12px; color:var(--homeii-surface-muted); font-size:14px; line-height:1.6; }
  .card .group-volume-card { padding:12px 16px!important; border-radius:18px!important; background:transparent!important; box-shadow:none!important; margin-bottom:14px; }
  .card .group-volume-card summary { cursor:pointer; min-height:32px; font-weight:500; }
  .card .group-player-card { background:color-mix(in srgb,var(--homeii-surface-text) 4%,transparent)!important; border:1px solid var(--homeii-surface-border)!important; border-radius:20px!important; box-shadow:none!important; }
  .card .group-player-card.checked { border-color:color-mix(in srgb,var(--homeii-surface-text) 45%,transparent)!important; }
  .card .group-player-row { min-height:84px; gap:12px; cursor:pointer; }
  .card .group-player-toggle svg { width:28px; height:28px; }
  .card .group-actions { position:sticky; bottom:0; display:flex; gap:12px; padding:12px 4px; background:var(--homeii-surface); backdrop-filter:blur(24px); border-top:1px solid var(--homeii-surface-border); }
  .card :is(.announcements-shell,.schedule-shell) { max-width:760px; width:100%; margin-inline:auto; box-sizing:border-box; }
  .card .announcements-shell { display:grid; gap:16px; padding:8px; }
  .card .announcements-shell .announcement-volume-field { display:grid!important; grid-template-columns:minmax(0,1fr) auto!important; align-items:center; gap:8px 16px; width:100%; min-width:0; }
  .card .announcements-shell .announcement-volume-field .settings-label { grid-column:1/-1; }
  .card .announcements-shell .announcement-volume-field input { width:100%!important; min-width:0; min-height:44px; margin:0; }
  .card :is(.announcement-target,.announcement-input-wrap,.schedule-panel-card,.schedule-row,.scheduled-start-card,.night-time-card) { border:1px solid var(--homeii-surface-border)!important; border-radius:20px!important; background:color-mix(in srgb,var(--homeii-surface-text) 4%,transparent)!important; box-shadow:none!important; color:var(--homeii-surface-text)!important; }
  .card .announcement-target { min-height:56px; padding:8px 14px; gap:12px; }
  .card .announcement-target-icon svg,.card .announcement-send-btn svg { width:28px; height:28px; }
  .card .announcement-textarea { min-height:150px; font:inherit; line-height:1.7; background:transparent!important; padding:18px 18px 60px; box-sizing:border-box; color:inherit; }
  .card :is(.announcement-target-select,.scheduled-start-field select) { min-height:44px; font:inherit; color:var(--homeii-surface-text); background:transparent!important; }
  .card :is(.announcement-send-btn,.group-actions .action-btn) { min-height:50px; border-radius:16px!important; box-shadow:none!important; font-size:15px; }
  .card .sleep-timer-action-row { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; margin-block:20px; }
  .card .sleep-timer-action-btn { min-height:64px; border-radius:18px!important; font-size:23px; font-weight:500; border:1px solid var(--homeii-surface-border)!important; background:color-mix(in srgb,var(--homeii-surface-text) 5%,transparent)!important; color:var(--homeii-surface-text); box-shadow:none!important; }
  .card .sleep-timer-action-btn.danger { grid-column:1/-1; min-height:44px; font-size:14px; }
  .card .lyrics-title-brand { display:none!important; }
  .card .lyrics-head { display:flex; flex-wrap:wrap; gap:16px; padding:20px!important; border-bottom:1px solid var(--homeii-surface-border); background:transparent!important; }
  .card .lyrics-title-wrap { flex:1 1 200px; min-width:0; }
  .card .lyrics-title { font-size:clamp(20px,3cqi,28px)!important; font-weight:550!important; white-space:normal!important; overflow-wrap:anywhere; line-height:1.4; }
  .card .lyrics-head-actions { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
  .card .lyrics-head-actions button { min-width:44px; min-height:44px; border-radius:14px!important; color:var(--homeii-surface-text); box-shadow:none!important; }
  .card .lyrics-head-actions svg { width:26px; height:26px; }
  .card .lyrics-body { padding:24px clamp(18px,5%,48px)!important; }
  .card .lyrics-pre { font-family:inherit; line-height:1.9; white-space:pre-wrap; text-align:center; }
  .card .lyrics-state { display:grid; place-content:center; min-height:180px; font-size:16px; color:var(--homeii-surface-muted); text-align:center; }
  /* One artwork treatment for every surface, with a stable contrast veil. */
  .card { --homeii-art-veil:rgba(12,14,18,.40); }
  .card.theme-light { --homeii-art-veil:rgba(250,251,253,.60); }
  .card #mobileMenu.menu-backdrop[class] .menu-sheet[class],
  .card :is(.menu-sheet,.queue-action-sheet,.lyrics-sheet,.history-drawer,.modal,.ctx-menu,.surprise-popup-card,.tablet-volume-popup,.smart-voice-sheet,.voice-assistant-dialog,.artist-info-dialog,.control-room-shell,.control-room-tray,.toast) {
    background:var(--homeii-surface)!important;
    isolation:isolate;
    background-blend-mode:normal!important;
  }
  .card #mobileMenu.menu-backdrop[class] .menu-sheet[class]::before,
  .card :is(.menu-sheet,.queue-action-sheet,.lyrics-sheet,.history-drawer,.modal,.ctx-menu,.surprise-popup-card,.tablet-volume-popup,.smart-voice-sheet,.voice-assistant-dialog,.artist-info-dialog,.control-room-shell,.control-room-tray,.toast)::before {
    content:""; position:absolute; inset:0; z-index:0; pointer-events:none;
    background:linear-gradient(var(--homeii-art-veil),var(--homeii-art-veil)),var(--lyrics-dynamic-art,var(--menu-dynamic-art,var(--dynamic-art-url,none))) center/cover!important;
    filter:blur(44px) saturate(1.08)!important; opacity:1!important; transform:none!important;
    border-radius:inherit;
  }
  .card .menu-backdrop.discovery-open .menu-sheet.sheet-discovery::after { background:none!important; }
  .card #mobileMenu.menu-backdrop[class] .menu-sheet[class] > *,
  .card :is(.queue-action-sheet,.lyrics-sheet,.history-drawer,.modal,.ctx-menu,.surprise-popup-card,.smart-voice-sheet,.voice-assistant-dialog,.artist-info-dialog,.control-room-shell,.control-room-tray) > * { position:relative; z-index:1; }
  .card #mobileMenu.menu-backdrop[class] :is(.menu-head,.menu-body,.library-shell,.library-body,.discovery-catalog,.media-detail-body,.artist-detail-body) { background:transparent!important; }
  .card #mobileMenu.menu-backdrop[class] .menu-head::before,
  .card #mobileMenu.menu-backdrop[class] .menu-head::after { background:none!important; }
  .card:not(.theme-light) #mobileMenu :is(.menu-title-text,.media-entry-title,.media-entry-sub,.menu-item-title,.menu-item-sub,.queue-title,.queue-sub,.settings-label,.settings-hint) { text-shadow:0 1px 4px rgba(0,0,0,.9),0 2px 12px rgba(0,0,0,.55); }
  .card #mobileMenu.menu-backdrop[class]::before { opacity:.7!important; filter:blur(48px) saturate(.8)!important; }
  .card #mobileMenu .menu-head { padding-top:max(12px,env(safe-area-inset-top,0px))!important; box-sizing:border-box; }
  .card .lyrics-backdrop { padding:0!important; box-sizing:border-box; }
  .card.lyrics-modal-open #mobileEdgeExitBtn { display:none!important; }
  .card .lyrics-sheet { width:100%!important; height:100%!important; max-height:100%!important; max-width:none!important; border-radius:0!important; box-sizing:border-box; padding:max(8px,env(safe-area-inset-top,0px)) max(8px,env(safe-area-inset-right,0px)) max(8px,env(safe-area-inset-bottom,0px)) max(8px,env(safe-area-inset-left,0px)); }
  .card .lyrics-head { flex-direction:column; align-items:center; padding:12px!important; gap:10px; }
  .card .lyrics-title-wrap { flex:0 0 auto; width:100%; text-align:center; }
  .card .lyrics-head-actions { width:100%; justify-content:center; gap:6px; }
  .card .lyrics-head-actions button { min-width:40px; min-height:40px; font-weight:500; background:transparent; }
  .card .lyrics-head-actions svg { width:23px; height:23px; }
  .card .lyrics-head-actions :is(.lyrics-font-controls,.lyrics-offset-controls) { background:transparent; border:0; padding:0; gap:0; }
  .card .lyrics-sync-btn span { display:none; }
  .card .lyrics-body { width:100%; box-sizing:border-box; text-align:center; scrollbar-width:none; }
  .card .lyrics-timeline { width:min(100%,850px); box-sizing:border-box; padding-inline:12px; }
  .card .lyrics-line { font-weight:500; opacity:.72; transform:none; color:var(--homeii-surface-text); overflow-wrap:anywhere; }
  .card .lyrics-line.active { font-weight:700; opacity:1; transform:none; color:var(--homeii-surface-text); text-shadow:none; }
  .card .queue-row:has(.queue-drag-handle) { grid-template-columns:36px 46px minmax(0,1fr) 40px!important; grid-template-areas:"idx thumb meta actions" "inline inline inline inline"!important; column-gap:8px!important; }
  .card .queue-row .queue-drag-handle { grid-area:idx; position:static!important; width:36px!important; max-width:36px; transform:none; }
  .card .action-hub .menu-item-ico svg { width:29px; height:29px; }
  .card .action-hub .menu-item-title { font-size:16px; }
  .card .action-hub-section h3 { font-size:15px; }
  .card.player-design-immersive .screen-dock,.card .screen-dock { display:none; }
  .card .fan-value { font-size:28px; font-weight:500; line-height:1.2; font-variant-numeric:tabular-nums; }
  .card .media-action-heading { grid-template-columns:76px minmax(0,1fr) 44px; margin-bottom:24px; }
  .card .media-action-art { width:76px; height:76px; border-radius:18px; }
  .card .media-action-heading .queue-action-title { font-size:20px; line-height:1.4; }
  .card .media-action-layout .media-action-grid { gap:12px; }
  .card .media-action-tools { margin-top:18px; grid-template-columns:repeat(2,minmax(0,1fr)); }
  .card .playlist-destination { width:100%; min-height:48px; padding:10px; border-radius:14px; background:var(--homeii-surface); color:var(--homeii-surface-text); border:1px solid var(--homeii-surface-border); font:inherit; }
  .card .media-action-layout.with-labels .queue-action-item { min-height:78px; font-size:14px; }
  .card .media-action-layout .queue-action-item svg { width:29px; height:29px; }
  .card #immersiveCloseBtn { background:transparent!important; border-color:transparent!important; box-shadow:none!important; backdrop-filter:none!important; -webkit-backdrop-filter:none!important; color:var(--homeii-surface-text)!important; }
  .mobile-edge-corner-btn { background:transparent!important; border:0!important; box-shadow:none!important; backdrop-filter:none!important; -webkit-backdrop-filter:none!important; border-radius:6px!important; width:44px!important; height:44px!important; }
  .mobile-edge-corner-btn svg { width:30px!important; height:30px!important; stroke-width:2.4; }
  .card .footer-nav:has(> .mobile-edge-corner-btn) { display:flex!important; }
  .card .footer-nav > .mobile-edge-corner-btn { position:static!important; inset:auto!important; transform:none!important; opacity:1!important; flex:0 0 44px; align-self:center; padding:7px!important; color:var(--homeii-surface-text)!important; }
  .card.player-design-immersive .immersive-layout .immersive-dock:has(.mobile-edge-corner-btn) { grid-template-columns:1fr 1fr minmax(0,1.4fr) 44px!important; }
  .card.player-design-immersive .immersive-layout .immersive-dock > .mobile-edge-corner-btn { position:static!important; inset:auto!important; transform:none!important; opacity:1!important; width:44px!important; height:44px!important; min-height:44px!important; padding:7px!important; color:var(--homeii-surface-text)!important; background:transparent!important; backdrop-filter:none!important; -webkit-backdrop-filter:none!important; }
  .card .screen-all-actions { position:absolute; inset:0 0 76px; z-index:29; padding:24px; overflow:auto; scrollbar-width:none; background:var(--homeii-surface); backdrop-filter:blur(40px); -webkit-backdrop-filter:blur(40px); color:var(--homeii-surface-text); }
  .card .screen-all-actions > div { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
  .card .screen-all-actions button { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; min-height:96px; padding:16px; border-radius:18px; border:1px solid var(--homeii-surface-border); background:transparent; color:inherit; font:inherit; }
  .card .screen-all-actions button svg { width:30px; height:30px; }
  .card #mobileQueueActionModal:has([data-dock-page="media_actions"]) { padding:0!important; }
  .card .queue-action-sheet[data-dock-page="media_actions"] { width:100%!important; max-width:none!important; height:100%!important; max-height:none!important; border-radius:0!important; padding:0!important; }
  .card .queue-action-sheet[data-dock-page="media_actions"] > .media-action-layout { height:100%; max-height:none!important; box-sizing:border-box; overflow:auto; padding: max(20px,env(safe-area-inset-top,0px)) 20px max(90px,env(safe-area-inset-bottom,0px))!important; }
  .card .media-library-back { display:flex; align-items:center; gap:10px; min-height:44px; margin:12px 0 20px; padding:8px 0; border:0; background:transparent; color:var(--homeii-surface-text); font:inherit; }
  .card .media-library-back svg { width:22px; height:22px; }
  .card #npArt .brand-fallback .fallback-disc { width:68%!important; height:auto!important; aspect-ratio:2/1; border:0!important; border-radius:0!important; background:transparent!important; box-shadow:none!important; }
  .card #npArt .art-stack-brand-logo { display:block!important; width:100%!important; height:100%!important; max-height:none!important; object-fit:contain!important; }
  @media(min-width:0px) {
    .card .has-screen-dock:not(.history-drawer) { position:relative; }
    .card .has-screen-dock > .screen-dock { position:absolute!important; z-index:30!important; inset:auto 0 0!important; transform:none!important; margin:0!important; width:100%!important; max-width:none!important; height:auto; min-height:66px; display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; padding:8px 14px max(8px,env(safe-area-inset-bottom,0px)); box-sizing:border-box; border-radius:20px 20px 0 0; background:var(--homeii-surface); backdrop-filter:blur(28px); -webkit-backdrop-filter:blur(28px); }
    .card .screen-dock > button { display:grid; place-items:center; width:100%; min-height:44px; border:0; color:var(--homeii-surface-text); background:transparent; }
    /* Keep the wheel outside a nested backdrop-filter root so it can blur the page. */
    .card .has-screen-dock > .screen-dock { background:transparent; backdrop-filter:none; -webkit-backdrop-filter:none; }
    .card .screen-dock::before { content:""; position:absolute; inset:0; border-radius:inherit; background:var(--homeii-surface); backdrop-filter:blur(28px); -webkit-backdrop-filter:blur(28px); pointer-events:none; }
    .card .screen-dock > button { position:relative; z-index:1; }
    .card .screen-dock > button svg { width:27px; height:27px; }
    .card .has-screen-dock > :is(.menu-body,.lyrics-body) { padding-bottom:90px!important; }
    .card .has-screen-dock > .media-action-layout { padding-bottom:78px; }
    .card .queue-action-sheet.has-screen-dock { overflow:hidden!important; padding:0!important; }
    .card .queue-action-sheet.has-screen-dock > .media-action-layout { max-height:min(85dvh,760px); overflow:auto; scrollbar-width:none; padding:20px 20px 94px; box-sizing:border-box; }
    .card .has-screen-dock > .history-drawer-body { padding-bottom:90px!important; }
    .card .has-screen-dock #historyDrawerCloseBtn,.card .has-screen-dock .media-action-heading [data-media-popup="close"],.card .has-screen-dock .media-action-heading [data-queue-popup="close"] { display:none!important; }
    .card .has-screen-dock .media-action-heading { grid-template-columns:76px minmax(0,1fr); }
    .card .media-action-layout .media-action-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
    .card .media-action-layout [data-media-popup="play"] { grid-column:1/-1; min-height:56px; flex-direction:row; }
    .card .has-screen-dock .library-nav { display:none!important; }
    .card .has-screen-dock .library-toolbar-player,.card .has-screen-dock .library-toolbar-icons { display:none!important; }
    .card .has-screen-dock .library-toolbar-search-inline { display:flex!important; }
    .card .has-screen-dock #mobileMenuCloseBtn,.card .has-screen-dock #lyricsCloseBtn { display:none!important; }
    /* Retain the source controls and their handlers for the contextual wheel.
       Only remove duplicate presentation where the mobile dock is available. */
    .card .has-screen-dock[data-dock-page="lyrics"] .lyrics-head-actions,
    .card .has-screen-dock[data-dock-page="sleep_timer"] .sleep-timer-action-row,
    .card .has-screen-dock #mobileMenuBackBtn { display:none!important; }
    .card .has-screen-dock .players-action-hub > :is([data-menu-nav="queue"],[data-menu-nav="group"]) { display:none!important; }
    .card .has-screen-dock[data-dock-page="lyrics"] .lyrics-head { padding:12px 20px!important; border-bottom:0; }
    .card .screen-dock .immersive-fan { width:min(440px,calc(100% - 16px)); }
    .card .immersive-fan-actions button img { width:42px; height:42px; border-radius:10px; object-fit:cover; }
    .card .screen-all-actions button img { width:42px; height:42px; border-radius:10px; object-fit:cover; }
    .card .fan-player-art { display:grid; place-items:center; width:46px; height:46px; border-radius:50%; overflow:hidden; flex-shrink:0; }
    .card .fan-player-art.selected { outline:2px solid currentColor; outline-offset:3px; }
    .card .fan-genre-name { font:600 13px/1.25 Heebo,sans-serif; white-space:normal; overflow-wrap:anywhere; text-align:center; max-width:72px; }
    .card .history-toggle-fab.tablet-history-fab { background:color-mix(in srgb,var(--homeii-surface,#18191c) 32%,transparent)!important; color:var(--homeii-surface-text)!important; border:1px solid color-mix(in srgb,var(--homeii-surface-text) 20%,transparent)!important; backdrop-filter:blur(22px) saturate(145%)!important; -webkit-backdrop-filter:blur(22px) saturate(145%)!important; box-shadow:0 6px 22px #0002,inset 0 1px 0 #fff2!important; }
    .card :is(.immersive-fan-actions,.screen-all-actions) .fan-player-art img { width:100%; height:100%; border-radius:50%; object-fit:cover; }
    .card .screen-dock .immersive-fan-actions button span { max-width:64px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  }
  /* Each screen owns one bounded scroll region and a separate navigation row.
     Overlays must be positioned against this viewport, never its scroll body. */
  .card #mobileMenu .menu-sheet.has-screen-dock,
  .card :is(#mobileQueueActionSheet,.menu-sheet,.lyrics-sheet).has-screen-dock:is(.queue-action-sheet,.lyrics-sheet) {
    position:relative!important; display:flex!important; flex-direction:column!important;
    width:100%!important; max-width:100%!important; height:100%!important; max-height:100%!important; min-height:0!important;
    box-sizing:border-box!important; overflow:hidden!important; padding:0!important;
    container-type:size; gap:0!important;
  }
  /* The drawer is an overlay on the player, not a full-size sheet in normal flow. */
  .card .history-drawer.has-screen-dock {
    display:flex; flex-direction:column; min-height:0; overflow:hidden;
    box-sizing:border-box; gap:0;
  }
  .card :is(#mobileQueueActionSheet,.menu-sheet,.lyrics-sheet,.history-drawer).has-screen-dock > :is(.menu-head,.lyrics-head,.history-drawer-head) { flex:0 0 auto; }
  .card #mobileMenu .has-screen-dock > .menu-body,
  .card :is(#mobileQueueActionSheet,.menu-sheet,.lyrics-sheet,.history-drawer).has-screen-dock > :is(.media-action-layout,.lyrics-body,.history-drawer-body) {
    flex:1 1 0%!important; height:auto!important; min-height:0!important; max-height:none!important;
    overflow:auto!important; overscroll-behavior:contain; scrollbar-width:none;
    box-sizing:border-box!important; padding-bottom:24px!important;
  }
  .card :is(#mobileQueueActionSheet,.menu-sheet,.lyrics-sheet,.history-drawer).has-screen-dock > .screen-dock {
    position:relative!important; inset:auto!important; flex:0 0 auto!important;
    min-height:66px!important; height:auto!important; z-index:40!important; display:grid!important; grid-template-columns:repeat(4,minmax(0,1fr))!important;
  }
  .card :is(#mobileQueueActionSheet,.menu-sheet,.lyrics-sheet,.history-drawer).has-screen-dock > .screen-dock > button { height:44px!important; min-height:44px!important; }
  .card :is(#mobileQueueActionSheet,.menu-sheet,.lyrics-sheet,.history-drawer).has-screen-dock > .screen-all-actions {
    position:absolute!important; inset:0 0 calc(66px + env(safe-area-inset-bottom,0px))!important;
    z-index:35!important; min-height:0!important; margin:0!important; box-sizing:border-box;
    padding: max(16px,env(safe-area-inset-top,0px)) clamp(12px,3%,24px) 20px;
    background:color-mix(in srgb,var(--homeii-surface) 65%,transparent);
  }
  .card .screen-all-actions > div { grid-template-columns:repeat(auto-fit,minmax(min(100%,140px),1fr)); }
  .card :is(#mobileQueueActionSheet,.menu-sheet,.lyrics-sheet,.history-drawer).has-screen-dock .group-actions { position:static!important; margin:16px 0 8px!important; padding-bottom:8px!important; }
  .card :is(#mobileQueueActionSheet,.menu-sheet,.lyrics-sheet,.history-drawer).has-screen-dock .queue-page-head-actions { display:none!important; }
  .card #mobileQueueActionModal:has([data-dock-page="media_actions"]) { background:transparent!important; backdrop-filter:none!important; }
  .card .queue-action-sheet[data-dock-page="media_actions"] { background:color-mix(in srgb,var(--homeii-surface) 48%,transparent)!important; }
  .card .queue-action-sheet[data-dock-page="media_actions"] > .media-action-layout { background:transparent!important; padding-bottom:24px!important; }
  .card.player-design-immersive .immersive-layout { justify-self:center!important; margin-inline:auto!important; }
  .card.player-design-immersive .immersive-art { grid-template-columns:minmax(0,1fr)!important; grid-template-rows:minmax(0,1fr)!important; grid-auto-flow:row!important; }
  .card.player-design-immersive .immersive-art #mobileArtShell { grid-area:1/1!important; position:relative!important; inset:auto!important; margin:auto!important; justify-self:center!important; }
  .card.player-design-immersive.layout-tablet #mobileArtShell { width:min(100cqw,100cqh,560px)!important; height:min(100cqw,100cqh,560px)!important; }
  .card.player-design-immersive.layout-tablet #mobileArtShell > .art-source-badges { display:none!important; }
  .card.player-design-immersive.layout-tablet #historyToggleFab:not([hidden]) { display:grid!important; }
  .card.player-design-immersive #npArt .art-stack-card { max-width:none!important; width:100%!important; height:100%!important; }
  .card.player-design-immersive .art-stack-slide { inset-inline-start:unset!important; inset-inline-end:unset!important; left:50%!important; right:auto!important; }
  @container (max-height:420px) {
    .card .screen-all-actions button { min-height:64px; padding:10px; gap:6px; }
    .card .screen-all-actions h2 { margin:0 0 12px; font-size:18px; }
  }
  @media(max-width:600px) {
    .card.player-design-immersive #mobileMenu .players-premium-grid:has(.player-choice-card) { grid-template-columns:minmax(0,1fr)!important; gap:10px!important; }
    .card .player-choice-card { border-radius:18px; background:color-mix(in srgb,var(--homeii-surface) 75%,transparent); }
    .card .player-choice-card.selected { border-color:color-mix(in srgb,var(--homeii-surface-text) 60%,transparent); background:color-mix(in srgb,var(--homeii-surface-text) 12%,var(--homeii-surface)); }
    .card .player-choice-button { min-height:100px; padding:14px; gap:12px; }
    .card .player-choice-symbol { width:62px; height:62px; border-radius:12px; }
    .card .player-choice-name { font-size:17px; font-weight:600; line-height:1.4; }
    .card.rtl .player-choice-name,.card.rtl .player-choice-track { text-align:right; }
    .card .player-choice-state { flex-wrap:wrap; color:var(--homeii-surface-text); }
    .card .player-choice-track { font-size:13px; line-height:1.5; white-space:normal; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .card .player-choice-check { width:22px; height:22px; }
    .card .player-choice-card .player-front-pin { width:32px!important; margin-inline-end:4px; }
    .card .player-choice-summary { gap:8px; margin:4px auto 14px; }
  }
`;
