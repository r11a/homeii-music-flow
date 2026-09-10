import heeboUrl from "./heebo.ttf?inline";
import { liveDiagnosticsStyles } from "./sheets/live-diagnostics.js";

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
${liveDiagnosticsStyles}
  :host, .card {
    --homeii-dialog-layer:2147483203;
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
  .card .lyrics-line.active [data-lyrics-word-time] { opacity:.5; transition:opacity .12s ease,color .12s ease; }
  .card .lyrics-line.active [data-lyrics-word-time].sung { opacity:1; color:var(--ma-accent,var(--homeii-surface-text)); }
  .card .listening-stats { padding:20px; color:var(--homeii-surface-text); }
  .card .menu-sheet[data-dock-page="group_volume"] { height:auto!important;min-height:0!important;max-height:calc(100% - 24px)!important; }
  .card .menu-sheet[data-dock-page="group_volume"] #mobileMenuBody { padding-bottom:88px; }
  .card .listening-stats-leader { display:flex;flex-direction:column;gap:8px;padding:20px;border-radius:22px;background:color-mix(in srgb,var(--ma-accent,#ffa83b) 12%,transparent); }
  .card .listening-stats-leader strong { font-size:24px;overflow-wrap:anywhere; }
  .card .listening-stats-summary { display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0; }
  .card .listening-stats-summary > div { display:flex;flex-direction:column;gap:8px;padding:24px;border:1px solid currentColor;border-radius:24px; }
  .card .listening-stats-summary strong { font-size:clamp(26px,5vw,48px); }
  .card .listening-stats-row { display:flex;justify-content:space-between;gap:16px;padding:16px 0;border-bottom:1px solid color-mix(in srgb,currentColor 12%,transparent); }
  .card .queue-move-pending { opacity:.65; transition:opacity .16s ease; }
  .card .queue-move-pending::after { content:"";width:18px;height:18px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:homeii-pending-spin .8s linear infinite; }
  @keyframes homeii-pending-spin { to { transform:rotate(360deg); } }
  .card .screen-all-actions { animation:homeii-screen-enter .18s ease-out; }
  @keyframes homeii-screen-enter { from {opacity:0;transform:translateY(8px);} to {opacity:1;transform:none;} }
  @media (prefers-reduced-motion:reduce) { .card .screen-all-actions,.card .queue-move-pending::after {animation:none;} }
  .card .lyrics-line.active { font-weight:700; opacity:1; transform:none; color:var(--homeii-surface-text); text-shadow:none; }
  .card .queue-row:has(.queue-drag-handle) { grid-template-columns:36px 46px minmax(0,1fr) 40px!important; grid-template-areas:"idx thumb meta actions" "inline inline inline inline"!important; column-gap:8px!important; }
  .card .queue-row .queue-drag-handle { grid-area:idx; position:static!important; width:36px!important; max-width:36px; transform:none; }
  .card .queue-row:has(.queue-drag-handle) > .menu-thumb { grid-area:thumb; position:relative!important; width:46px!important; height:46px!important; min-width:0; margin:0!important; transform:none!important; }
  .card .queue-row:has(.queue-drag-handle) > .queue-actions { grid-area:actions; min-width:0; margin:0; }
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
  .card .art-stack-fallback.art-idle { position:absolute; inset:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; margin:0; border:0; box-shadow:none; background:radial-gradient(ellipse at center,color-mix(in srgb,var(--ma-accent) 12%,transparent),transparent 70%); }
  .card .art-idle::before,.card .art-idle::after { content:none; }
  .card .art-idle img.art-idle-logo { position:relative!important; inset:auto!important; display:block!important; width:48%!important; height:auto!important; max-width:280px!important; max-height:none!important; object-fit:contain!important; aspect-ratio:auto!important; background:transparent!important; border:0!important; border-radius:0!important; box-shadow:none!important; opacity:.88; }
  @media(min-width:0px) {
    .card .has-screen-dock:not(.history-drawer) { position:relative; }
    .card .has-screen-dock > .screen-dock { position:absolute!important; z-index:30!important; inset:auto 0 0!important; transform:none!important; margin:0!important; width:100%!important; max-width:none!important; height:auto; min-height:66px; display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; padding:8px 14px max(8px,env(safe-area-inset-bottom,0px)); box-sizing:border-box; border-radius:20px 20px 0 0; background:var(--homeii-surface); backdrop-filter:blur(28px); -webkit-backdrop-filter:blur(28px); }
    .card .screen-dock > button { display:grid; place-items:center; width:100%; min-height:44px; border:0; color:var(--homeii-surface-text); background:transparent; }
    /* Keep the wheel outside a nested backdrop-filter root so it can blur the page. */
    .card .has-screen-dock > .screen-dock { background:transparent; backdrop-filter:none; -webkit-backdrop-filter:none; }
    .card .screen-dock::before { content:""; position:absolute; inset:0; border-radius:inherit; background:var(--homeii-surface); backdrop-filter:blur(28px); -webkit-backdrop-filter:blur(28px); pointer-events:none; }
    .card .screen-dock > button { position:relative; z-index:1; }
    .card .screen-dock > button svg { width:27px; height:27px; }
    .card .screen-dock > [data-screen-player] { display:flex; justify-content:center; gap:6px; min-width:0; padding:0 5px; }
    .card .screen-dock > [data-screen-player] svg { flex:none; }
    .screen-player-name { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; font-weight:500; }
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
    .card .fan-player-art.selected { outline:2px solid #f5a623; outline-offset:3px; box-shadow:0 0 14px #f5a62366; }
    .card .fan-player-art.leader { outline:2px solid #9bddf5; outline-offset:3px; box-shadow:0 0 14px #9bddf566; }
    .card .fan-genre-name { font:600 13px/1.25 Heebo,sans-serif; white-space:normal; overflow-wrap:anywhere; text-align:center; max-width:72px; }
    .card .history-toggle-fab.tablet-history-fab { background:transparent!important; color:var(--homeii-surface-text)!important; border:0!important; backdrop-filter:none!important; -webkit-backdrop-filter:none!important; box-shadow:none!important; }
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
  .card .history-drawer.has-screen-dock > .screen-dock {
    background:transparent!important;
    backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
    border-top:1px solid var(--homeii-surface-border);
  }
  .card .history-drawer.has-screen-dock > .screen-dock::before {
    background:rgba(255,255,255,.12);
    backdrop-filter:blur(24px) saturate(1.2); -webkit-backdrop-filter:blur(24px) saturate(1.2);
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
  .card :is(#mobileQueueActionSheet,.menu-sheet,.lyrics-sheet,.history-drawer).has-screen-dock .queue-page-head-actions { display:flex; }
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
  /* Hidden toolbar actions must not reserve grid columns beside the filters. */
  .card .has-screen-dock #mobileMenuBody .library-toolbar-minimal {
    display:grid!important; grid-template-columns:minmax(0,1fr) minmax(110px,.55fr)!important;
    gap:10px!important; width:100%; min-width:0; box-sizing:border-box;
  }
  .card .has-screen-dock #mobileMenuBody .library-toolbar-search-inline { grid-column:1!important; min-width:0!important; width:100%!important; }
  .card .has-screen-dock #mobileMenuBody .library-toolbar-sort { grid-column:2!important; width:100%; min-width:0; }
  .card #mobileMenu :is(.library-toolbar-search,.library-tab-search-row) {
    min-height:44px!important; box-sizing:border-box; border-radius:16px!important;
    background:var(--homeii-surface)!important; border:1px solid var(--homeii-surface-border)!important;
  }
  .card #mobileMenu [data-library-tab-search-input] { min-width:0!important; min-height:44px!important; font-size:16px!important; color:var(--homeii-surface-text)!important; }
  .card .immersive-fan-actions button:has(.fan-player-art) { gap:6px; }
  .card .immersive-fan-actions button:has(.fan-player-art) > span:last-child:not(.fan-player-art) {
    display:block; max-width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:11px; line-height:1.4;
  }
  .card #mobileMenu :is(.library-tab-search-submit,.library-tab-search-clear) { min-width:36px; min-height:44px; }
  .card #mobileMenu :is(.library-toolbar-sort-select,#discoveryCategorySelect,#discoveryProviderSelect) {
    width:100%!important; min-width:0!important; min-height:44px!important; font-size:16px!important;
    border-radius:16px!important; color:var(--homeii-surface-text)!important;
    background-color:var(--homeii-surface)!important; border:1px solid var(--homeii-surface-border)!important;
  }
  .card #mobileMenu :is([data-library-tab-search-input],select):focus-visible { outline:2px solid var(--homeii-surface-text); outline-offset:2px; }
  .card .screen-all-actions::-webkit-scrollbar { width:0; height:0; }
  .card .player-choice-counts { display:flex; flex-wrap:wrap; align-items:center; gap:8px 18px; }
  .card .player-choice-counts > span { display:inline-flex; align-items:baseline; gap:6px; white-space:nowrap; }
  .card .player-choice-counts bdi { color:var(--homeii-surface-text); font-weight:600; font-variant-numeric:tabular-nums; }
  .card .control-room-shell.has-screen-dock { display:flex; flex-direction:column; min-height:0; }
  .card .control-room-shell.has-screen-dock > .control-room-body-host { position:relative; inset:auto; flex:1; min-height:0; }
  .card .control-room-shell.has-screen-dock > .screen-dock {
    position:relative!important; inset:auto!important; flex:none; width:100%; max-width:none; margin:0; z-index:40;
    display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); min-height:66px; padding:8px 12px max(8px,env(safe-area-inset-bottom,0px)); box-sizing:border-box;
  }
  .card .control-room-shell.has-screen-dock .control-room-dock { display:none; }
  .card .control-room-tray { inset-inline-start:auto; left:50%; right:auto; transform:translateX(-50%); box-sizing:border-box; }
  .card .control-room-tray:has(.control-room-panel-close) { padding-top:58px; }
  .card .control-room-tray > .control-room-panel-close { position:absolute; top:8px; inset-inline-end:10px; z-index:3; width:40px; height:40px; padding:9px; display:grid; place-items:center; border:1px solid var(--homeii-surface-border); border-radius:50%; background:var(--homeii-surface); color:var(--homeii-surface-text); cursor:pointer; }
  .card .control-room-panel-close svg { width:20px; height:20px; }
  .card .control-room-shell.has-screen-dock > .screen-all-actions { bottom:82px; }
  .card .control-room-shell.has-screen-dock [data-control-room-scroll] { scrollbar-width:none; }
  .card .control-room-shell.has-screen-dock [data-control-room-scroll]::-webkit-scrollbar { width:0; height:0; }
  .card .control-room-shell input[type="range"] { accent-color:rgb(var(--dynamic-accent-rgb,200 155 86)); min-height:32px; }
  @media(max-width:600px) {
    .card.player-design-immersive .history-drawer.open { inset:0!important; width:100%!important; height:100%!important; max-height:none!important; margin:0!important; transform:none!important; box-sizing:border-box; }
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

  .card > .fan-catalogue { inset:0; z-index:120; padding:max(16px,env(safe-area-inset-top)) 20px max(20px,env(safe-area-inset-bottom)); }
  .card .fan-catalogue header { display:flex; align-items:center; gap:12px; position:sticky; top:0; z-index:2; background:var(--homeii-surface); backdrop-filter:blur(32px); }
  .card .fan-catalogue header h2 { flex:1; margin:0; }
  .card .fan-catalogue header button { min-height:44px; padding:8px 12px; }
  .card .fan-catalogue article { display:flex; align-items:center; gap:8px; min-width:0; }
  .card .fan-catalogue article > button[data-catalogue-action] { width:100%; height:100%; }
  .card .fan-catalogue.is-editing .fan-catalogue-list { display:flex; flex-direction:column; }
  .card .fan-catalogue.is-editing article > button { min-height:48px; padding:8px; }
  .card .fan-catalogue.is-editing [data-catalogue-action] { flex:1; flex-direction:row; justify-content:start; opacity:1; text-align:start; }
  .card .fan-catalogue input { width:22px; height:22px; accent-color:var(--ma-accent); }
  .card .fan-catalogue [data-catalogue-drag] { touch-action:none; cursor:grab; }

  .card .smart-hub-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:14px; }
  .card .smart-hub-grid button { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; min-height:120px; background:var(--homeii-surface); border:1px solid var(--homeii-surface-border); border-radius:22px; color:inherit; font:inherit; }
  .card .smart-hub-grid svg { width:32px; height:32px; }
  .card .recommendation-shelf { display:flex; overflow-x:auto; gap:16px; scroll-snap-type:x proximity; scrollbar-width:none; }
  .card .recommendation-shelf button { flex:0 0 clamp(140px,30vw,220px); display:flex; flex-direction:column; gap:6px; color:inherit; text-align:start; border:0; padding:0 0 12px; background:transparent; font:inherit; scroll-snap-align:start; }
  .card .recommendation-shelf :is(img,svg) { width:100%; aspect-ratio:1; object-fit:cover; border-radius:18px; }
  .card .recommendation-shelf strong { font-weight:600; }
  .card .recommendation-shelf span { font-size:.85em; opacity:.72; }

  .card .volume-wheel-popover { position:absolute; z-index:121; bottom:max(76px,env(safe-area-inset-bottom)); left:50%; transform:translateX(-50%); width:min(320px,90%); padding:18px; border-radius:160px 160px 28px 28px; border:1px solid var(--homeii-surface-border); background:var(--homeii-surface); backdrop-filter:blur(40px); color:var(--homeii-surface-text); display:flex; align-items:center; flex-direction:column; gap:10px; }
  .card .volume-wheel-dial { border-radius:50%; width:160px; height:160px; background:conic-gradient(var(--ma-accent) var(--dial-value), #8883 0); display:grid; place-items:center; touch-action:none; cursor:grab; }
  .card .volume-wheel-dial output { display:grid; place-items:center; width:140px; height:140px; border-radius:50%; background:var(--homeii-surface); font-size:28px; }
  .card .volume-wheel-popover button { background:transparent; border:0; color:inherit; min-height:44px; min-width:44px; }

  .card .smart-settings { max-width:560px; margin-inline:auto; display:grid; gap:18px; }
  .card .smart-settings label { display:flex; gap:12px; align-items:center; justify-content:space-between; }
  .card .smart-settings :is(input:not([type=checkbox]),select,button) { min-height:44px; border-radius:12px; border:1px solid var(--homeii-surface-border); padding:10px; background:var(--homeii-surface); color:inherit; font:inherit; }

  .card .menu-sheet[data-dock-page="group_volume"] { inset:auto!important; bottom:0!important; width:min(560px,100%)!important; max-height:85%!important; margin-inline:auto!important; border-radius:40px 40px 0 0!important; background:var(--homeii-surface)!important; backdrop-filter:blur(40px)!important; }
  .card [data-dock-page="group_volume"] .players-premium-grid { grid-template-columns:1fr!important; }
  .card [data-dock-page="group_volume"] .player-premium-track { display:none; }
  /* Transparent glass: the artwork is visible through blur, not painted over it. */
  .card :is(.immersive-fan,.volume-wheel-popover) {
    --fan-glass-base:rgba(16,20,28,.38);
    --fan-glass-tint:color-mix(in srgb,var(--ma-accent,#64748b) 7%,transparent);
    --fan-glass-edge:rgba(255,255,255,.3);
    background:linear-gradient(var(--fan-glass-tint),var(--fan-glass-tint)),var(--fan-glass-base);
    border-color:var(--fan-glass-edge);
    backdrop-filter:blur(32px) saturate(1.35);
    -webkit-backdrop-filter:blur(32px) saturate(1.35);
    box-shadow:0 14px 38px #0003,inset 0 1px 0 #ffffff55,inset 0 -1px 0 #ffffff12;
    color:var(--homeii-surface-text);
  }
  .card.theme-light :is(.immersive-fan,.volume-wheel-popover) { --fan-glass-base:rgba(250,252,255,.46); --fan-glass-edge:rgba(255,255,255,.64); }
  .card[data-fan-theme="dark"] :is(.immersive-fan,.volume-wheel-popover) { --fan-glass-base:rgba(16,20,28,.46); --fan-glass-tint:transparent; color:#f4f5f6; --homeii-surface-muted:#d4d9e0; }
  .card[data-fan-theme="light"] :is(.immersive-fan,.volume-wheel-popover) { --fan-glass-base:rgba(250,252,255,.54); --fan-glass-tint:transparent; --fan-glass-edge:rgba(255,255,255,.7); color:#20242b; --homeii-surface-muted:#414b59; }
  .card .immersive-fan::before { content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none; background:linear-gradient(145deg,#ffffff20 0%,#ffffff06 30%,transparent 52%,#ffffff09 100%); }
  .card .immersive-fan > div { z-index:1; }
  .card .immersive-fan-navigation { border-top-color:color-mix(in srgb,currentColor 12%,transparent); }
  @supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))) {
    .card :is(.immersive-fan,.volume-wheel-popover) { --fan-glass-base:rgba(16,20,28,.92); }
    .card.theme-light .immersive-fan,.card[data-fan-theme="light"] :is(.immersive-fan,.volume-wheel-popover) { --fan-glass-base:rgba(250,252,255,.94); }
    .card[data-fan-theme="dark"] :is(.immersive-fan,.volume-wheel-popover) { --fan-glass-base:rgba(16,20,28,.92); }
  }
  .card :is(.smart-hub,.smart-settings,.listening-lighting,.recommendation-home) { box-sizing:border-box; width:100%; max-width:880px; margin-inline:auto; padding:clamp(16px,3vw,28px); color:var(--homeii-surface-text); text-align:start; }
  .card :is(.smart-hub,.smart-settings,.listening-lighting,.recommendation-home) h2 { font-size:clamp(22px,3vw,30px); font-weight:550; letter-spacing:-.025em; margin:0 0 14px; }
  .card .smart-hub-grid { grid-template-columns:repeat(auto-fit,minmax(min(100%,110px),1fr)); gap:12px; }
  .card .smart-hub-grid button { background:color-mix(in srgb,var(--homeii-surface-text) 5%,transparent); border-radius:20px; min-height:100px; text-align:center; transition:background .18s; padding:12px 8px; }
  .card .smart-hub-grid button:hover { background:color-mix(in srgb,var(--ma-accent) 14%,transparent); }
  .card .smart-hub { max-width:760px; padding-block:clamp(24px,5cqh,48px); }
  .card .smart-hub > .smart-hub-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; }
  .card .smart-hub > .smart-hub-grid button { min-height:132px; padding:20px 12px; gap:18px; border-radius:24px; }
  .card .smart-hub > .smart-hub-grid svg { width:36px; height:36px; flex-shrink:0; }
  .card .smart-hub > .smart-hub-grid span { font-size:15px; line-height:1.35; font-weight:450; overflow-wrap:anywhere; }
  @container (min-width:600px) {
    .card .smart-hub > .smart-hub-grid { grid-template-columns:repeat(3,minmax(0,1fr)); gap:22px; }
    .card .smart-hub > .smart-hub-grid button { min-height:148px; }
  }
  .card .smart-settings { display:flex; flex-wrap:wrap; gap:16px; }
  .card .smart-settings > :is(h2,p) { flex-basis:100%; }
  .card .smart-settings > label { flex:1 1 220px; display:flex; gap:12px; flex-direction:column; align-items:stretch; min-width:0; }
  .card .smart-settings > label:has(input[type="checkbox"]) { flex:0 1 auto; flex-direction:row; align-items:center; padding:10px 14px; border:1px solid var(--homeii-surface-border); border-radius:14px; }
  .card .smart-settings :is(input,select,button) { box-sizing:border-box; font:inherit; color:inherit; border:1px solid var(--homeii-surface-border); border-radius:14px; background:color-mix(in srgb,var(--homeii-surface-text) 5%,transparent); padding:12px; min-height:46px; max-width:100%; }
  .card .smart-settings input[type="checkbox"] { min-height:20px; width:20px; accent-color:var(--ma-accent); }
  .card .smart-settings input[type="time"],.card .volume-wheel-dial { direction:ltr; }
  .card .smart-settings button[type="submit"] { flex-basis:100%; cursor:pointer; background:color-mix(in srgb,var(--ma-accent) 20%,transparent); }
  .card.rtl :is(.smart-hub,.smart-settings,.listening-lighting,.recommendation-home,.fan-catalogue,.group-volume-card,.group-player-card) { direction:rtl; }
  .card :is(.player-premium-name,.recommendation-shelf strong,.recommendation-shelf span) { unicode-bidi:plaintext; text-align:start; }
  .card .volume-wheel-popover { border-radius:28px; }
  .card .volume-wheel-dial:active { cursor:grabbing; }
  /* Fullscreen menu layers use the 21474826xx–32xx range in compact.js.
     The volume wheel is a child dialog and must remain above those screens. */
  .card .volume-wheel-popover { padding-top:48px; box-sizing:border-box; z-index:var(--homeii-dialog-layer); }
  .card > .fan-catalogue { z-index:var(--homeii-dialog-layer); }
  .card .group-operation-feedback,
  .card #toastWrap { z-index:calc(var(--homeii-dialog-layer) + 1); }
  .card .volume-wheel-popover [data-volume-close] { position:absolute; top:4px; inset-inline-end:4px; display:grid; place-items:center; padding:12px; }
  .card .volume-wheel-popover [data-volume-close] svg { width:18px; height:18px; }
  .card .volume-wheel-popover [data-volume-mute] svg { width:26px; height:26px; }
  .card .volume-wheel-popover [data-volume-mute].active { color:var(--ma-accent); }
  .card .volume-wheel-dial output { background:linear-gradient(var(--fan-glass-tint),var(--fan-glass-tint)),var(--fan-glass-base); }

  .card .lyrics-timeline.karaoke-active .lyrics-line { opacity:.42; transition:opacity .2s ease,color .2s ease; }
  .card .lyrics-timeline.karaoke-active .lyrics-line.active { opacity:1; color:var(--ma-accent,var(--homeii-surface-text)); }
  .card .menu-sheet[data-dock-page="group_volume"] { bottom:max(12px,env(safe-area-inset-bottom))!important; width:min(560px,calc(100% - 24px))!important; border-radius:28px!important; }
  .card [data-dock-page="group_volume"] .group-volume-card summary { display:none; }
  .card [data-dock-page="group_volume"] .group-player-card { border:1px solid var(--homeii-surface-border); border-radius:18px; background:transparent; padding:12px; }
  .card [data-dock-page="group_volume"] .player-mini-volume { min-height:44px; }
  .card [data-dock-page="group_volume"] .group-player-check { position:static; opacity:1; width:22px; height:22px; accent-color:var(--ma-accent); }
  /* Immersive screen controls share one visual vocabulary, preserving classic. */
  .card.player-design-immersive {
    --flow-control-bg:color-mix(in srgb,var(--homeii-surface-text) 5%,transparent);
    --flow-control-selected:color-mix(in srgb,var(--ma-accent) 16%,transparent);
    --flow-control-radius:14px;
  }
  .card.player-design-immersive :is(.menu-body,.recommendation-home,.recommendation-home > section,.recommendation-shelf) { min-width:0; max-width:100%; }
  .card.player-design-immersive #mobileMenu .menu-body { overflow-x:hidden!important; }
  .card.player-design-immersive .recommendation-shelf { width:100%; box-sizing:border-box; overscroll-behavior-x:contain; touch-action:pan-x pan-y; }
  .card.player-design-immersive .recommendation-shelf button { min-width:0; overflow:hidden; flex-basis:clamp(140px,38cqw,190px); }
  .card.player-design-immersive .recommendation-shelf :is(button > svg,.recommendation-art > svg) { box-sizing:border-box; padding:28%; background:var(--flow-control-bg); border:1px solid var(--homeii-surface-border); color:var(--homeii-surface-muted); }
  .card.player-design-immersive .recommendation-shelf button > :is(strong,span) { width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .card.player-design-immersive :is(.schedule-tabs,.history-drawer-tabs,.settings-pills) { display:flex; flex-wrap:wrap; gap:6px; padding:5px; border:1px solid var(--homeii-surface-border); border-radius:18px; background:transparent; box-shadow:none; }
  .card.player-design-immersive :is(.settings-pill,.history-tab,.sleep-timer-action-btn,.history-play-all-btn,.action-btn,.control-room-tray-btn,.chip-btn) {
    box-sizing:border-box; min-height:44px; padding:10px 16px; border:1px solid var(--homeii-surface-border)!important;
    border-radius:var(--flow-control-radius)!important; background:var(--flow-control-bg)!important;
    color:var(--homeii-surface-text)!important; box-shadow:none!important; text-shadow:none!important;
    font-family:var(--homeii-font-family)!important; font-size:14px!important; line-height:1.4; font-weight:500!important;
  }
  .card.player-design-immersive :is(.queue-more-btn,.media-more-btn,.media-play-btn,.media-detail-play-btn) {
    box-sizing:border-box; padding:0!important; width:40px; height:40px; min-width:40px; min-height:40px;
    flex:0 0 auto; display:inline-flex; align-items:center; justify-content:center;
  }
  .card.player-design-immersive :is(.queue-more-btn,.media-more-btn,.media-play-btn,.media-detail-play-btn) svg { flex:none; width:20px; height:20px; margin:0; }
  .card.player-design-immersive #mobileMenu .media-entry.grid :is(.media-more-btn,.media-play-btn) {
    width:40px!important; height:40px!important; min-width:40px!important; min-height:40px!important; inset-block-start:14px!important; inset-block-end:auto!important;
    border-radius:50%!important; background:rgba(24,28,34,.58)!important; color:#fff!important;
    border:1px solid rgba(255,255,255,.3)!important; backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
  }
  .card.player-design-immersive.theme-light #mobileMenu .media-entry.grid :is(.media-more-btn,.media-play-btn) { background:rgba(255,255,255,.76)!important; color:#20252d!important; border-color:rgba(30,40,55,.18)!important; }
  .card.player-design-immersive .has-screen-dock .queue-playback-options { display:none; }
  .card.player-design-immersive #mobileMenu :is(.queue-page-count,.queue-page-head-actions button,.queue-row.active .queue-title) { color:var(--homeii-surface-text)!important; text-shadow:none!important; }
  .card.player-design-immersive #mobileMenu :is(.queue-page-count,.queue-page-head-actions) svg { color:inherit!important; filter:none; }
  .card.player-design-immersive :is(.settings-pill,.history-tab).active,
  .card.player-design-immersive :is(.settings-pill,.history-tab)[aria-selected="true"] { background:var(--flow-control-selected)!important; border-color:color-mix(in srgb,var(--ma-accent) 65%,transparent)!important; color:var(--homeii-surface-text)!important; }
  .card.player-design-immersive :is(.schedule-tabs,.history-drawer-tabs) > button { flex:1 1 0; min-width:0; }
  .card.player-design-immersive .history-play-all-btn { display:inline-flex; align-items:center; gap:8px; width:auto; margin-block:0 14px; }
  .card.player-design-immersive .history-play-all-btn svg { width:20px; height:20px; }
  .card.player-design-immersive :is(.schedule-panel-card,.settings-group,.announcement-card) { border:1px solid var(--homeii-surface-border); border-radius:20px; background:transparent; padding:18px; box-shadow:none; }
  .card.player-design-immersive :is(.schedule-panel-card,.settings-group,.history-drawer) :is(h2,h3,h4) { font-weight:550; text-shadow:none!important; letter-spacing:0; }
  .card.player-design-immersive :is(.menu-body,.history-drawer,.media-action-layout,.control-room-tray) { font-family:var(--homeii-font-family); text-shadow:none!important; }
  .card.player-design-immersive .media-action-layout > :is(.media-action-heading,.media-action-grid,.media-action-tools,.media-action-secondary) { width:100%; max-width:880px; margin-inline:auto; box-sizing:border-box; }
  .card.player-design-immersive .media-action-layout.with-labels .media-action-grid { grid-template-columns:repeat(auto-fit,minmax(min(100%,160px),1fr)); gap:12px; }
  .card.player-design-immersive .media-action-layout.with-labels .queue-action-item { min-height:74px; border-radius:var(--flow-control-radius); background:var(--flow-control-bg); font-weight:500; }
  .card.player-design-immersive .media-action-layout [data-media-popup="play"] { background:var(--flow-control-selected)!important; color:var(--homeii-surface-text)!important; border:1px solid color-mix(in srgb,var(--ma-accent) 65%,transparent)!important; }
  .card.player-design-immersive .media-action-layout.with-labels [data-media-popup="play"] { grid-column:auto; }
  .card.player-design-immersive :is(.menu-body,.control-room-tray) :is(select,input:not([type=range]):not([type=checkbox]):not([type=radio]),textarea) { box-sizing:border-box; max-width:100%; min-width:0; min-height:44px; border:1px solid var(--homeii-surface-border); border-radius:var(--flow-control-radius); background:var(--flow-control-bg); color:var(--homeii-surface-text); font:inherit; padding:10px 12px; }
  .card.player-design-immersive.rtl :is(.menu-body,.history-drawer,.media-action-layout,.control-room-tray) { direction:rtl; }
  .card.player-design-immersive :is(.menu-body,.history-drawer,.media-action-layout) :is(p,h2,h3,label) { text-shadow:none!important; }
  .card.player-design-immersive #mobileMenu :is(.album-detail-shell,.artist-detail-shell) { width:100%; max-width:960px; margin-inline:auto; min-width:0; }
  .card.player-design-immersive #mobileMenu .album-detail-player { position:relative; top:auto; display:grid; grid-template-columns:clamp(110px,28cqw,240px) minmax(0,1fr); align-items:center; gap:24px; border:0!important; background:transparent!important; box-shadow:none!important; backdrop-filter:none; padding:12px 0 24px; border-radius:0; }
  .card.player-design-immersive #mobileMenu .media-detail-art-stage { width:100%; min-width:0; }
  .card.player-design-immersive #mobileMenu .media-detail-art { width:100%; height:auto; aspect-ratio:1; border-radius:20px; box-shadow:0 12px 30px #0002; }
  .card.player-design-immersive #mobileMenu .media-detail-title { font-size:clamp(22px,4cqw,36px); font-weight:600; line-height:1.25; }
  .card.player-design-immersive #mobileMenu .media-detail-hero-actions { justify-content:flex-start; }
  .card.player-design-immersive #mobileMenu .media-detail-sub { font-weight:400; }
  .card.player-design-immersive #mobileMenu .media-detail-kicker { font-weight:500; letter-spacing:0; text-transform:none; color:var(--homeii-surface-muted); }
  .card.player-design-immersive #mobileMenu .media-detail-sub { margin-block:8px; color:var(--homeii-surface-muted); line-height:1.5; }
  .card.player-design-immersive #mobileMenu .album-detail-shell { height:auto; grid-template-rows:max-content max-content auto; align-content:start; }
  .card.player-design-immersive #mobileMenu .album-detail-player { min-height:max-content; }
  .card.player-design-immersive #mobileMenu .media-detail-track-list { gap:0; overflow:visible; scrollbar-width:none; }
  .card.player-design-immersive :is(.menu-sheet,.history-drawer,.lyrics-sheet,.control-room-shell),
  .card.player-design-immersive :is(.menu-sheet,.history-drawer,.lyrics-sheet,.control-room-shell) * { scrollbar-width:none; }
  .card.player-design-immersive :is(.menu-sheet,.history-drawer,.lyrics-sheet,.control-room-shell)::-webkit-scrollbar,
  .card.player-design-immersive :is(.menu-sheet,.history-drawer,.lyrics-sheet,.control-room-shell) *::-webkit-scrollbar { display:none; }
  .card.player-design-immersive #mobileMenu .media-detail-track-list::-webkit-scrollbar { display:none; }
  .card.player-design-immersive #mobileMenu :is(.album-detail-player,.artist-detail-hero)::before,
  .card.player-design-immersive #mobileMenu :is(.album-detail-player,.artist-detail-hero)::after { display:none; }
  .card.player-design-immersive #mobileMenu .media-detail-hero-main { min-width:0; }
  .card.player-design-immersive #mobileMenu .media-detail-track-row { min-height:64px; border:0; border-bottom:1px solid var(--homeii-surface-border); border-radius:0; background:transparent; box-shadow:none; padding:8px 4px; }
  .card.player-design-immersive #mobileMenu .media-detail-track-title { font-weight:500; color:var(--homeii-surface-text); }
  .card.player-design-immersive #mobileMenu :is(.media-detail-track-sub,.media-detail-track-duration,.media-detail-track-index) { font-weight:400; color:var(--homeii-surface-muted); }
  .card.player-design-immersive #mobileMenu .media-detail-track-index { background:transparent; }
  .card.player-design-immersive #mobileMenu .artist-detail-hero { grid-template-columns:clamp(90px,20cqw,160px) minmax(0,1fr) auto!important; grid-template-areas:"art copy actions"!important; min-height:0; border:0!important; background:transparent!important; box-shadow:none!important; gap:20px; padding:12px 0 24px; }
  .card.player-design-immersive #mobileMenu .artist-detail-title { font-weight:600; font-size:clamp(24px,4cqw,38px); }
  .card.player-design-immersive #mobileMenu .artist-detail-art { width:100%; max-width:160px; height:auto; aspect-ratio:1; border-radius:50%; }
  .card.player-design-immersive #mobileMenu .artist-year-group { border:0; background:transparent; box-shadow:none; padding:8px 0 20px; }
  .card.player-design-immersive #mobileMenu .artist-year-title { font-size:15px; font-weight:500; color:var(--homeii-surface-muted); padding-block:12px; }
  .card.player-design-immersive #mobileMenu .artist-detail-shell .media-entry.grid { border:0; background:transparent; box-shadow:none; padding:8px; }
  .card.player-design-immersive #mobileMenu .artist-detail-shell .media-entry.grid .menu-thumb { border-radius:16px; }
  .card.player-design-immersive #mobileMenu .artist-detail-shell .menu-item-title { font-weight:500; line-height:1.4; }
  @container (max-width:500px) {
    .card.player-design-immersive #mobileMenu .album-detail-player { grid-template-columns:1fr; grid-template-areas:"art" "copy"; gap:16px; text-align:center; }
    .card.player-design-immersive #mobileMenu .media-detail-art-stage { width:min(62cqw,240px); margin-inline:auto; }
    .card.player-design-immersive #mobileMenu .media-detail-copy { justify-items:center; text-align:center; }
    .card.player-design-immersive #mobileMenu .media-detail-hero-actions { justify-content:center; }
    .card.player-design-immersive #mobileMenu .artist-detail-hero { grid-template-columns:90px minmax(0,1fr)!important; grid-template-areas:"art copy" "actions actions"!important; }
    .card.player-design-immersive #mobileMenu .artist-detail-actions { grid-column:1/-1; justify-content:flex-start; }
  }
  .card.player-design-immersive :is(.menu-title-text,.history-drawer-title,.fan-catalogue header h2,.lyrics-title,.smart-hub h2,.smart-settings h2,.listening-lighting h2,.recommendation-home h2) { font-family:var(--homeii-font-family)!important; font-size:clamp(18px,2.2cqw,22px)!important; font-weight:500!important; line-height:1.4!important; letter-spacing:0!important; text-shadow:none!important; }
  .card.player-design-immersive .menu-sheet:has(> .fan-catalogue) > :is(.menu-body,.menu-header) { visibility:hidden; }
  .card.player-design-immersive :is(.queue-action-sheet,.history-drawer,.lyrics-sheet,.control-room-shell):has(> .fan-catalogue) > :is(.media-action-layout,.history-drawer-body,.history-drawer-head,.lyrics-body,.control-room-body-host) { visibility:hidden; }
  .card.player-design-immersive .fan-catalogue header { width:100%; max-width:960px; margin:0 auto 20px; padding:10px 0; box-sizing:border-box; gap:12px; background:transparent; backdrop-filter:none; border-bottom:1px solid var(--homeii-surface-border); }
  .card.player-design-immersive .fan-catalogue header button { flex-direction:row; min-height:44px; font-family:var(--homeii-font-family); font-size:13px; font-weight:400; border:0; border-radius:14px; background:var(--flow-control-bg); }
  .card.player-design-immersive .fan-catalogue header [data-catalogue-back] { width:44px; padding:10px; background:transparent; }
  .card.player-design-immersive .fan-catalogue header [data-catalogue-back] svg { width:22px; height:22px; }
  .card.player-design-immersive.rtl .fan-catalogue header [data-catalogue-back] svg { transform:scaleX(-1); }
  .card.player-design-immersive .fan-catalogue-list { width:100%; max-width:960px; margin-inline:auto; grid-template-columns:repeat(auto-fit,minmax(min(100%,130px),1fr)); }
  .card.player-design-immersive .fan-catalogue-list [data-catalogue-action] { font:500 14px/1.45 var(--homeii-font-family); }

  .card.player-design-immersive.theme-light :is(#mobileVolumeDownBtn,#mobileVolumeUpBtn) { color:#17191c!important; }
  .card.player-design-immersive .recommendation-shelf > button { position:relative; overflow:hidden; }
  .card .recommendation-shelf .recommendation-art { position:relative; display:grid; width:100%; aspect-ratio:1; border-radius:18px; overflow:hidden; opacity:1; transition:box-shadow .18s ease; }
  .card .recommendation-shelf .recommendation-art > :is(img,svg) { width:100%; height:100%; }
  .card .recommendation-shelf > button:is(.library-action-feedback,.library-action-loading) .recommendation-art { box-shadow:inset 0 0 0 1px var(--ma-accent),0 0 18px color-mix(in srgb,var(--ma-accent) 12%,transparent); }
  .card .recommendation-shelf .library-playback-loader { opacity:1; }
  .card.player-design-immersive.performance-lite :is(.immersive-fan,.volume-wheel-popover),
  .card.player-design-immersive.performance-lite .screen-dock::before { backdrop-filter:none!important; -webkit-backdrop-filter:none!important; }
  .card.player-design-immersive.performance-lite :is(.immersive-fan,.volume-wheel-popover) { --fan-glass-base:rgba(20,23,29,.97); background:linear-gradient(var(--fan-glass-tint),var(--fan-glass-tint)),var(--fan-glass-base)!important; box-shadow:none!important; }
  .card.player-design-immersive.performance-lite.theme-light :is(.immersive-fan,.volume-wheel-popover),
  .card.player-design-immersive.performance-lite[data-fan-theme="light"] :is(.immersive-fan,.volume-wheel-popover) { --fan-glass-base:rgba(248,250,253,.97); }
  .card.player-design-immersive.performance-lite[data-fan-theme="dark"] :is(.immersive-fan,.volume-wheel-popover) { --fan-glass-base:rgba(20,23,29,.97); }
  .card.player-design-immersive.performance-lite :is(.immersive-fan,.immersive-fan-actions button,.art-stack-track) { animation:none!important; transition:none!important; }

  .card.player-design-immersive .fan-catalogue-category { grid-column:1/-1; margin:18px 0 4px; font:500 15px/1.4 var(--homeii-font-family); color:var(--homeii-surface-muted); text-align:start; }
  .saved-playlist-row { display:flex; min-width:0; gap:8px; align-items:stretch; }
  .card .player-mini-volume { direction:ltr; }
  .card.player-design-immersive .player-volume-row { grid-template-columns:44px minmax(0,1fr) 48px; min-height:52px; gap:10px; }
  .card.player-design-immersive .player-mini-volume { min-width:0; height:44px!important; margin:0; background:transparent; touch-action:pan-y; cursor:pointer; }
  .card.player-design-immersive .player-mini-volume::-webkit-slider-runnable-track { height:10px; border-radius:8px; background:linear-gradient(to right,var(--ma-accent) var(--vol-pct,50%),color-mix(in srgb,var(--homeii-surface-text) 20%,transparent) var(--vol-pct,50%)); }
  .card.player-design-immersive .player-mini-volume::-webkit-slider-thumb { width:24px!important; height:24px!important; margin-top:-7px; border:2px solid var(--homeii-surface-text); box-shadow:0 2px 8px #0003; }
  .card.player-design-immersive .player-mini-volume::-moz-range-track { height:10px; border-radius:8px; background:linear-gradient(to right,var(--ma-accent) var(--vol-pct,50%),color-mix(in srgb,var(--homeii-surface-text) 20%,transparent) var(--vol-pct,50%)); }
  .card.player-design-immersive .player-mini-volume::-moz-range-thumb { width:22px!important; height:22px!important; border:2px solid var(--homeii-surface-text); }
  .card .player-volume-percent { min-width:44px; min-height:44px; padding:0 2px; border:0; background:transparent; color:inherit; font:500 14px var(--homeii-font-family); font-variant-numeric:tabular-nums; cursor:pointer; text-align:center; direction:ltr; }
  .card.player-design-immersive .player-mini-mute { width:44px; height:44px; background:transparent; border:0; }
  .card.player-design-immersive .player-mini-mute .ui-ic { width:24px; height:24px; }
  .volume-wheel-title { max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font:500 15px var(--homeii-font-family); }
  .card .smart-settings > form { display:grid; gap:14px; width:100%; min-width:0; }
  .card .smart-settings > form label { flex-direction:column; align-items:stretch; min-width:0; }
  .card .smart-settings > .smart-hub-grid { width:100%; min-width:0; }
  .card .smart-settings :is(input,select) { min-width:0; }
  .saved-playlist-row button span { overflow-wrap:anywhere; }
  .saved-playlist-row > button:first-child { flex:1; min-width:0; }
  .saved-playlist-row > button:last-child { min-height:44px; width:auto; font-size:12px; }
  .card.player-design-immersive #mobileMenu .media-detail-hero-actions .media-detail-play-btn[data-media-detail-action="play"] { width:52px; height:52px; min-width:52px; display:inline-flex; align-items:center; justify-content:center; color:var(--homeii-surface-text); }
  .card.player-design-immersive #mobileMenu .media-detail-hero-actions .media-detail-play-btn[data-media-detail-action="play"] svg { width:24px; height:24px; }
  .fan-preference-scope { display:flex; gap:12px; align-items:center; margin:12px; font:inherit; }
  .fan-preference-scope select { max-width:100%; padding:10px; border:1px solid var(--homeii-surface-border); border-radius:14px; background:var(--homeii-surface); color:inherit; font:inherit; }
  .player-choice-card { position:relative; }
  .player-group-drag { flex:none; width:44px; height:44px; border:0; border-radius:50%; background:transparent; color:inherit; touch-action:none; cursor:grab; }
  .player-group-drag svg { width:22px; height:22px; }
  .player-choice-card.group-drop-target { outline:2px solid var(--ma-accent); outline-offset:2px; box-shadow:0 0 18px color-mix(in srgb,var(--ma-accent) 30%,transparent); }
  .player-choice-card.group-drag-source { opacity:.65; }
  [data-group-drag-art] { cursor:grab; touch-action:none; user-select:none; }
  [data-group-drag-art] img { pointer-events:none; }
  .group-player-card { position:relative; }
  .group-player-card.group-drop-target { outline:2px solid var(--ma-accent); outline-offset:3px; box-shadow:0 0 30px color-mix(in srgb,var(--ma-accent) 35%,transparent); }
  .group-player-card.group-drag-source { opacity:.65; }
  .group-drop-target :is(.player-choice-symbol,.player-premium-art) { transform:scale(1.08); transition:transform .2s ease; }
  .group-quick-connect { display:flex; align-items:center; justify-content:center; gap:8px; min-height:44px; margin:4px 12px 10px; padding:8px 18px; border:1px solid var(--homeii-surface-border); border-radius:99px; color:var(--homeii-surface-text); background:var(--homeii-surface); font:500 14px var(--homeii-font-family); }
  .group-quick-connect svg { width:22px; height:22px; }
  .player-choice-card { transition:outline-color .18s, box-shadow .18s; }
  .player-group-preview { position:absolute; z-index:30; pointer-events:none; display:flex; align-items:center; gap:10px; max-width:220px; padding:12px 18px; border:1px solid var(--homeii-surface-border); border-radius:24px; background:var(--homeii-surface); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); box-shadow:0 12px 36px #0003; transform:translate(-50%,-50%) scale(1.04); font:500 14px/1.3 var(--homeii-font-family); }
  .player-group-preview[hidden] { display:none!important; }
  .player-group-preview .player-choice-symbol { width:44px; height:44px; flex:none; }
  .player-group-preview .player-premium-art { width:44px; height:44px; flex:none; }
  .group-pair-names { font:400 13px var(--homeii-font-family); color:var(--homeii-surface-muted); text-align:center; overflow-wrap:anywhere; }
  .player-group-preview > span:last-child { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .group-connecting { outline:2px solid var(--ma-accent); animation:homeii-group-breathe 1.4s ease-in-out infinite; }
  .player-group-status { position:absolute; inset:0; display:grid; place-items:center; border-radius:inherit; background:var(--homeii-surface); backdrop-filter:blur(18px); font:500 14px var(--homeii-font-family); }
  .group-connected { animation:homeii-group-confirm .65s ease-out; }
  @keyframes homeii-group-breathe { 50% { box-shadow:0 0 24px color-mix(in srgb,var(--ma-accent) 25%,transparent); } }
  @keyframes homeii-group-confirm { 0% { transform:scale(.98); } 55% { transform:scale(1.015); } 100% { transform:scale(1); } }
  @media(prefers-reduced-motion:reduce) { .group-connecting,.group-connected { animation:none; } }
  .group-operation-feedback { position:absolute; z-index:120; inset-inline:0; bottom:calc(90px + env(safe-area-inset-bottom,0px)); margin-inline:auto; width:max-content; max-width:85%; display:flex; align-items:center; gap:14px; padding:14px 24px; border:1px solid var(--homeii-surface-border); border-radius:26px; background:var(--homeii-surface); color:var(--homeii-surface-text); backdrop-filter:blur(26px); -webkit-backdrop-filter:blur(26px); box-shadow:0 12px 40px #0002; font:500 14px/1.5 var(--homeii-font-family); animation:homeii-group-arrive .2s ease-out; pointer-events:none; }
  .group-operation-symbols { display:flex; gap:8px; width:42px; justify-content:center; }
  .group-operation-symbols i { width:14px; height:14px; border:1.5px solid currentColor; border-radius:50%; opacity:.65; transition:transform .5s cubic-bezier(.2,.8,.2,1),opacity .5s; }
  .group-operation-feedback.has-player-art { top:50%; bottom:auto; transform:translateY(-50%); flex-direction:column; width:min(320px,85%); padding:28px 24px; gap:22px; box-sizing:border-box; border-radius:32px; }
  .has-player-art .group-operation-symbols { direction:ltr; width:168px; gap:20px; }
  .has-player-art .group-operation-symbols i { display:grid; place-items:center; width:64px; height:64px; flex:none; overflow:hidden; opacity:1; border:2px solid var(--homeii-surface-border); border-radius:22px; background:var(--homeii-surface); box-shadow:0 8px 28px #0003; }
  .has-player-art .group-operation-symbols img { width:100%; height:100%; object-fit:cover; }
  .has-player-art .group-operation-symbols svg { width:32px; height:32px; }
  .has-player-art.is-connect:not(.is-confirmed) .group-operation-symbols i:first-child { animation:homeii-pair-left 1.4s ease-in-out infinite; }
  .has-player-art.is-connect:not(.is-confirmed) .group-operation-symbols i:last-child { animation:homeii-pair-right 1.4s ease-in-out infinite; }
  .has-player-art.is-confirmed .group-operation-symbols i { border-color:#90e6ee; box-shadow:0 0 22px #90e6ee44; }
  .has-player-art.is-connect.is-confirmed .group-operation-symbols i:first-child { transform:translateX(12px) rotate(-5deg); }
  .has-player-art.is-connect.is-confirmed .group-operation-symbols i:last-child { transform:translateX(-12px) rotate(5deg); }
  .has-player-art.is-disconnect .group-operation-symbols i:first-child { transform:translateX(10px); }
  .has-player-art.is-disconnect .group-operation-symbols i:last-child { transform:translateX(-10px); }
  .has-player-art.is-disconnect.is-confirmed .group-operation-symbols i:first-child { transform:translateX(-10px); }
  .has-player-art.is-disconnect.is-confirmed .group-operation-symbols i:last-child { transform:translateX(10px); }
  @keyframes homeii-pair-left { 50% { transform:translateX(8px) rotate(-3deg); } }
  @keyframes homeii-pair-right { 50% { transform:translateX(-8px) rotate(3deg); } }
  @media(prefers-reduced-motion:reduce) { .has-player-art .group-operation-symbols i { animation:none!important; transition:none!important; } }
  .is-connect.is-confirmed .group-operation-symbols i:first-child { transform:translateX(5px); opacity:1; }
  .is-connect.is-confirmed .group-operation-symbols i:last-child { transform:translateX(-5px); opacity:1; }
  .is-disconnect.is-confirmed .group-operation-symbols i:first-child { transform:translateX(-4px); }
  .is-disconnect.is-confirmed .group-operation-symbols i:last-child { transform:translateX(4px); }
  @keyframes homeii-group-arrive { from { opacity:0; translate:0 6px; } to { opacity:1; translate:0 0; } }
  @media(prefers-reduced-motion:reduce) { .group-operation-feedback { animation:none; } .group-operation-symbols i { transition:none; } }
  .card.player-design-immersive.performance-lite *,
  .card.player-design-immersive.performance-lite *::before,
  .card.player-design-immersive.performance-lite *::after { backdrop-filter:none!important; -webkit-backdrop-filter:none!important; box-shadow:none!important; }
  .card.player-design-immersive.performance-lite :is(.player-group-preview,.group-operation-feedback,.player-group-status,.fan-catalogue,.smart-settings) { background:var(--homeii-surface-solid,var(--card-background-color,#202226)); }
`;

