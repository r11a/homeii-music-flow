// One presentation contract for the immersive interface, including compact cards.
// Playback and wheel positioning stay in their existing controllers.
export const premiumStyles = `
.card.player-design-immersive {
  --flow-premium-glass:color-mix(in srgb,var(--ma-accent,#64748b) 7%,rgba(19,22,28,.76));
  --flow-premium-edge:color-mix(in srgb,var(--homeii-surface-text) 15%,transparent);
  --flow-premium-shadow:0 16px 44px #0003,inset 0 1px 0 #ffffff16;
  --flow-control-size:40px;
}
.card.player-design-immersive.theme-light {
  --flow-premium-glass:color-mix(in srgb,var(--ma-accent,#64748b) 5%,rgba(250,251,253,.80));
  --flow-premium-shadow:0 12px 36px #18283814,inset 0 1px 0 #ffffff80;
}
.card.player-design-immersive :is(.immersive-fan,.volume-wheel-popover) {
  --fan-glass-base:var(--flow-premium-glass);
  border:1px solid var(--flow-premium-edge);
  background:var(--flow-premium-glass)!important;
  backdrop-filter:blur(28px) saturate(1.25);
  -webkit-backdrop-filter:blur(28px) saturate(1.25);
  box-shadow:var(--flow-premium-shadow);
}
.card.player-design-immersive[data-fan-theme="dark"] :is(.immersive-fan,.volume-wheel-popover) { background:rgba(19,22,28,.91)!important; }
.card.player-design-immersive[data-fan-theme="light"] :is(.immersive-fan,.volume-wheel-popover) { background:rgba(250,251,253,.93)!important; }
.card.player-design-immersive .immersive-fan-actions button {
  font:500 12px/1.3 var(--homeii-font-family); letter-spacing:0;
  -webkit-tap-highlight-color:transparent;
}
.card.player-design-immersive .immersive-fan-actions button > .ui-ic { width:26px; height:26px; padding:6px; box-sizing:content-box; border-radius:50%; }
.card.player-design-immersive .immersive-fan-actions button[aria-pressed="true"] { background:transparent!important; box-shadow:none!important; }
.card.player-design-immersive .immersive-fan-actions button[aria-pressed="true"] > :is(.ui-ic,.fan-player-art) { outline:2px solid var(--ma-accent); outline-offset:3px; }
.card.player-design-immersive :is(button,a,input,select):focus-visible { outline:2px solid var(--ma-accent); outline-offset:3px; }
.card.player-design-immersive :is(.menu-title-text,.fan-catalogue header h2,.screen-all-actions h2) { font:600 clamp(18px,2.4cqi,23px)/1.35 var(--homeii-font-family)!important; letter-spacing:0; }
.card.player-design-immersive :is(.menu-header,.fan-catalogue header) { gap:12px; padding-block:12px; }
.card.player-design-immersive :is(.screen-dock,.footer-nav) { gap:8px; }
.card.player-design-immersive .history-drawer .screen-dock { background:color-mix(in srgb,var(--homeii-surface-text) 7%,var(--flow-premium-glass))!important; border-top:1px solid var(--flow-premium-edge); }
.card.player-design-immersive #mobileMenu .media-entry.grid {
  padding:10px!important; gap:10px; align-content:start;
  border-radius:18px!important;
}
.card.player-design-immersive #mobileMenu .media-entry.grid .menu-thumb {
  width:100%; max-width:none; height:auto; min-height:0; aspect-ratio:1;
  border-radius:12px!important; overflow:hidden;
}
.card.player-design-immersive #mobileMenu .media-entry.grid .menu-thumb img { aspect-ratio:1; object-fit:cover; }
.card.player-design-immersive #mobileMenu .media-entry.grid :is(.media-more-btn,.media-play-btn) {
  width:var(--flow-control-size); height:var(--flow-control-size); min-width:var(--flow-control-size); min-height:var(--flow-control-size);
  inset-block-start:18px; border-radius:50%; display:grid; place-items:center; padding:0;
  color:#fff; background:rgba(16,20,27,.62); border:1px solid #ffffff38; box-shadow:0 2px 8px #0002;
}
.card.player-design-immersive #mobileMenu .media-entry.grid .media-more-btn { inset-inline-start:18px; }
.card.player-design-immersive #mobileMenu .media-entry.grid .media-play-btn { inset-inline-end:18px; }
.card.player-design-immersive #mobileMenu .media-entry.grid :is(.media-more-btn,.media-play-btn) .ui-ic { width:19px; height:19px; }
.card.player-design-immersive #mobileMenu .media-entry.grid .menu-item-title { font:500 14px/1.4 var(--homeii-font-family); min-height:2.8em; margin:0; }
.card.player-design-immersive #mobileMenu .media-entry.grid .menu-item-sub { font:400 12px/1.4 var(--homeii-font-family); color:var(--homeii-surface-muted); }
.card.player-design-immersive #mobileMenu .library-nav-btn.active {
  background:color-mix(in srgb,var(--ma-accent) 16%,transparent)!important;
  color:var(--homeii-surface-text)!important;
  box-shadow:inset 0 -2px 0 var(--ma-accent)!important;
}
.card.player-design-immersive #mobileMenu .media-detail-title { font:600 clamp(23px,3.4cqi,38px)/1.2 var(--homeii-font-family)!important; letter-spacing:-.02em; overflow-wrap:anywhere; }
.card.player-design-immersive #mobileMenu .media-detail-kicker { font-size:12px; font-weight:500; letter-spacing:.04em; color:var(--homeii-surface-muted); }
.card.player-design-immersive #mobileMenu .media-detail-hero { gap:clamp(16px,3cqi,32px); }
.card.player-design-immersive #mobileMenu .media-detail-art { border-radius:18px; overflow:hidden; box-shadow:0 12px 32px #0003; }
.card.player-design-immersive #mobileMenu :is(.media-detail-track-row,.queue-row) { min-height:56px; column-gap:12px; }
.card.player-design-immersive .fan-catalogue-list { gap:12px; }
.card.player-design-immersive .fan-catalogue-category { margin:24px 0 2px; padding-block-end:8px; border-bottom:1px solid var(--flow-premium-edge); font-size:13px; font-weight:500; }
.card.player-design-immersive .fan-catalogue-list article { min-height:100px; }
.card.player-design-immersive .fan-catalogue-list [data-catalogue-action] { display:flex; flex-direction:column; justify-content:center; align-items:center; gap:10px; padding:16px 12px; font:500 14px/1.4 var(--homeii-font-family); text-align:center; }
.card.player-design-immersive .fan-catalogue-list [data-catalogue-action] .ui-ic { width:26px; height:26px; }
.card.player-design-immersive .fan-catalogue.is-editing .fan-catalogue-list article { min-height:58px; }
.card.player-design-immersive .fan-catalogue.is-editing [data-catalogue-action] { flex-direction:row; justify-content:flex-start; text-align:start; }
.card.player-design-immersive .immersive-metadata #npSub { opacity:.85; }
.card.player-design-immersive .toast { border-radius:18px; font:500 14px/1.45 var(--homeii-font-family); box-shadow:var(--flow-premium-shadow); }
@media(hover:hover) and (prefers-reduced-motion:no-preference) {
  .card.player-design-immersive:not(.performance-lite) #mobileMenu .media-entry.grid:hover { translate:0 -2px; }
}
@media(prefers-reduced-motion:no-preference) {
  .card.player-design-immersive:not(.performance-lite) :is(.media-entry.grid,.media-action-btn,.fan-catalogue-list article) { transition:translate .18s var(--flow-ease),background-color .16s ease,border-color .16s ease; }
  .card.player-design-immersive:not(.performance-lite) :is(.media-play-btn,.media-more-btn,[data-catalogue-action]):active { scale:.96; }
}
.card.player-design-immersive.performance-lite :is(.immersive-fan,.volume-wheel-popover) { background:var(--homeii-surface-solid,#202226)!important; backdrop-filter:none; -webkit-backdrop-filter:none; box-shadow:none; }
.card.player-design-immersive.performance-lite.theme-light :is(.immersive-fan,.volume-wheel-popover),
.card.player-design-immersive.performance-lite[data-fan-theme="light"] :is(.immersive-fan,.volume-wheel-popover) { background:#f8fafc!important; }
@media(max-width:420px) {
  .card.player-design-immersive { --flow-control-size:36px; }
  .card.player-design-immersive #mobileMenu .media-entry.grid { padding:8px!important; }
  .card.player-design-immersive #mobileMenu .media-entry.grid :is(.media-more-btn,.media-play-btn) { inset-block-start:14px; }
  .card.player-design-immersive #mobileMenu .media-entry.grid .media-more-btn { inset-inline-start:14px; }
  .card.player-design-immersive #mobileMenu .media-entry.grid .media-play-btn { inset-inline-end:14px; }
}
`;

export const premiumContentStyles = `
.card .scene-list { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr)); gap:14px; }
.card .scene-tile { display:flex; flex-direction:column; gap:16px; padding:20px; border:1px solid var(--flow-premium-edge,#ffffff30); border-radius:20px; background:var(--flow-raised,#ffffff0c); }
.card .scene-tile strong { font-size:18px; font-weight:600; }
.card .scene-tile p { font-size:13px; opacity:.8; }
.card .scene-tile small { overflow-wrap:anywhere; opacity:.7; }
.card .scene-actions { display:flex; flex-wrap:wrap; gap:8px; margin-block-start:auto; }
.card .scene-actions button { display:flex; align-items:center; gap:6px; min-height:44px; border-radius:14px; }
.card .scene-actions .ui-ic { width:20px; height:20px; }
.card .scene-editor { margin-block:20px; }
.card .scene-editor summary { padding:16px; cursor:pointer; }
.card .scene-editor fieldset { border:1px solid var(--flow-premium-edge,#ffffff30); border-radius:14px; }
.card .scene-editor .smart-settings { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); max-width:720px; margin-inline:auto; padding:0; gap:18px; align-items:start; }
.card .scene-editor .smart-settings > * { grid-column:1 / -1; }
.card .scene-editor .smart-settings > label:first-of-type,
.card .scene-editor .smart-settings > label:nth-of-type(2) { grid-column:auto; }
.card .scene-editor button { min-height:44px; padding:10px 18px; border-radius:14px; border:1px solid var(--flow-premium-edge,#ffffff30); color:inherit; background:rgba(255,255,255,.09); font:inherit; }
.card .scene-editor fieldset { display:flex; flex-wrap:wrap; gap:12px 20px; padding:16px; min-width:0; }
.card .scene-editor fieldset label { display:flex; flex-direction:row; align-items:center; gap:8px; }
.card .scene-editor input[type="checkbox"] { width:20px; height:20px; flex:0 0 auto; }
.card .scene-editor .smart-settings > label { display:flex; flex-direction:column; align-items:stretch; gap:8px; }
.card .scene-editor .smart-settings > button { background:color-mix(in srgb,var(--ma-accent) 10%,#ffffff12); }
.card .scene-editor .smart-settings > button[type="submit"] { background:color-mix(in srgb,var(--ma-accent) 23%,#ffffff18); }
.card .scene-editor input[name="media"] { direction:ltr; text-align:start; }
.card .scene-light-options { border-block-start:1px solid var(--flow-premium-edge,#ffffff30); }
.card .radio-shortcuts { display:flex; gap:8px; width:100%; min-width:0; overflow-x:auto; scrollbar-width:none; padding:8px 0; flex:0 0 auto; }
.card .radio-shortcuts::-webkit-scrollbar { display:none; }
.card .radio-shortcuts button { flex:1 0 92px; min-width:0; max-width:180px; min-height:44px; display:flex; align-items:center; justify-content:center; gap:6px; padding:8px 10px; border-radius:15px; border:1px solid var(--flow-premium-edge,#ffffff30); background:rgba(255,255,255,.08); color:inherit; font:inherit; font-size:12px; }
.card .radio-shortcuts button span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.card .radio-shortcuts svg { width:19px; height:19px; flex:0 0 auto; }
.card .radio-pin-editor { padding:14px; margin-block-end:18px; border:1px solid var(--flow-premium-edge,#ffffff30); border-radius:18px; }
.card .radio-pin-editor summary { cursor:pointer; min-height:32px; }
.card .radio-pin-editor > div { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:12px; }
.card .radio-pin-editor label { display:flex; align-items:center; gap:8px; }
.card .radio-pin-editor input { width:20px; height:20px; }

.card.player-design-immersive :is(.library-toolbar input,.library-toolbar select,.library-tab-search input,.library-toolbar-search-inline input) { border-radius:14px; font:400 15px/1.4 var(--homeii-font-family); }
.card.player-design-immersive :is(.recommendation-home h2,.smart-hub h2,.media-detail-section-title) { font:600 clamp(18px,2.4cqi,24px)/1.35 var(--homeii-font-family); letter-spacing:0; margin-block:20px 12px; }
.card.player-design-immersive :is(.recommendation-card,.recommendation-shelf .recommendation-art) { border-radius:14px; }
.card.player-design-immersive .recommendation-shelf { gap:14px; scroll-padding-inline:16px; }
.card.player-design-immersive :is(.media-action-grid,.action-hub-grid) { gap:12px; }
.card.player-design-immersive .media-action-layout .media-action-btn { border-radius:16px; min-height:58px; font:500 14px/1.4 var(--homeii-font-family); }
.card.player-design-immersive .media-action-layout :is(.media-action-section-title,.media-action-secondary-title) { font:500 13px/1.4 var(--homeii-font-family); color:var(--homeii-surface-muted); margin-block:20px 10px; }
.card.player-design-immersive :is(.menu-empty,.library-empty,.library-error,.media-empty) { padding:24px 16px; text-align:center; font:400 15px/1.6 var(--homeii-font-family); color:var(--homeii-surface-muted); border-radius:18px; background:var(--flow-raised); }
.card.player-design-immersive:not(.compact-mode) .immersive-transport { column-gap:clamp(20px,5cqi,44px); }
.card.player-design-immersive:not(.compact-mode) .immersive-metadata { padding-inline:8px; }
.card.player-design-immersive :is(.immersive-dock,.screen-dock) > button { font-family:var(--homeii-font-family); }
.card.player-design-immersive .immersive-fan-actions button[aria-pressed="true"] > span:last-child { color:inherit; text-shadow:none; }
@supports not (backdrop-filter:blur(1px)) {
 .card.player-design-immersive :is(.immersive-fan,.volume-wheel-popover) { background:#202226!important; }
 .card.player-design-immersive.theme-light :is(.immersive-fan,.volume-wheel-popover) { background:#f8fafc!important; }
}
`;

/* Each alternate style owns its surface geometry; actions keep the shared controller. */
export const fanVariantStyles = `
.card .fan-ribbon-rail { display:none; }
.card.player-design-immersive .immersive-fan:is([data-fan-style="ribbon"],[data-fan-style="orbit"]) {
 height:208px; border:0!important; border-radius:24px; background:transparent!important; box-shadow:none!important;
 backdrop-filter:none!important; -webkit-backdrop-filter:none!important; overflow:visible;
 --lens-surface:linear-gradient(145deg,color-mix(in srgb,var(--ma-accent) 18%,rgba(255,255,255,.18)),rgba(25,28,35,.40));
 --lens-edge:rgba(255,255,255,.26);
}
.card.player-design-immersive .immersive-fan:is([data-fan-style="ribbon"],[data-fan-style="orbit"])::before,
.card.player-design-immersive .immersive-fan:is([data-fan-style="ribbon"],[data-fan-style="orbit"])::after { display:none!important; }
/* A feathered scrim separates controls behind the wheel without a solid panel. */
.card.player-design-immersive .immersive-fan:is([data-fan-style="ribbon"],[data-fan-style="orbit"])::before {
 display:block!important; content:""; position:absolute; inset:-18px; z-index:0; pointer-events:none;
 background:rgba(12,15,22,.70)!important; backdrop-filter:blur(22px); -webkit-backdrop-filter:blur(22px);
 mask-image:radial-gradient(ellipse at 50% 50%,#000 45%,transparent 74%);
}
.card.player-design-immersive.theme-light .immersive-fan:not([data-fan-style="classic"])::before { background:rgba(244,247,251,.72)!important; }
.card.player-design-immersive .immersive-fan:not([data-fan-style="classic"]) .immersive-fan-actions { bottom:54px; }
.card.player-design-immersive .immersive-fan:not([data-fan-style="classic"]) .immersive-fan-actions button {
 width:var(--fan-item-size,60px); min-height:86px; padding:0; gap:10px; background:transparent!important; overflow:visible; isolation:isolate;
}
.card.player-design-immersive .immersive-fan .fan-lens { display:grid!important; place-items:center; flex:none; width:52px!important; height:52px; max-width:none!important;
 border-radius:50%; background:var(--lens-surface); border:1px solid var(--lens-edge); box-sizing:border-box;
 box-shadow:inset 0 1px 1px #ffffff55,inset 0 -8px 16px #0002,0 8px 18px #0003;
 backdrop-filter:blur(20px) saturate(1.3); -webkit-backdrop-filter:blur(20px) saturate(1.3);
}
.card.player-design-immersive .immersive-fan .fan-lens > .ui-ic { padding:0; width:25px; height:25px; }
.card.player-design-immersive .immersive-fan .fan-lens :is(.fan-player-art,img) { width:100%!important; height:100%!important; border-radius:inherit; object-fit:cover; }
.card.player-design-immersive .immersive-fan .fan-lens .fan-player-art { overflow:hidden; }
.card.player-design-immersive .immersive-fan:not([data-fan-style="classic"]) .immersive-fan-actions button > span:last-child:not(.fan-lens) { font-size:11px; line-height:1.3; max-width:70px; color:var(--homeii-surface-text); text-shadow:0 1px 4px #0008; }
.card.player-design-immersive .immersive-fan .fan-center .fan-lens { border-color:color-mix(in srgb,var(--ma-accent) 55%,white); box-shadow:inset 0 1px 1px #ffffff66,0 0 0 2px color-mix(in srgb,var(--ma-accent) 18%,transparent),0 8px 24px #0004; }
.card.player-design-immersive .immersive-fan:not([data-fan-style="classic"]) [aria-pressed="true"]::after { display:none; }
.card.player-design-immersive .immersive-fan:not([data-fan-style="classic"]) [aria-pressed="true"] .fan-lens { outline:2px solid var(--ma-accent); outline-offset:3px; }
.card.player-design-immersive .immersive-fan[data-fan-style="ribbon"] .fan-ribbon-rail { display:block; position:absolute; inset:0 0 auto; width:100%; height:130px; overflow:visible; pointer-events:none; }
.card.player-design-immersive .fan-ribbon-rail path { fill:none; stroke:color-mix(in srgb,var(--ma-accent) 12%,#ffffff24); stroke-width:10; stroke-linecap:round; }
.card.player-design-immersive .immersive-fan[data-fan-style="orbit"] .fan-lens { width:60px!important; height:66px; border-radius:50%; }
.card.player-design-immersive .immersive-fan[data-fan-style="orbit"] .fan-center .fan-lens { outline:1px solid #ffffff55; outline-offset:3px; }
.card.player-design-immersive .immersive-fan:not([data-fan-style="classic"]) .immersive-fan-navigation {
 inset-inline:24px; bottom:0; border:1px solid #ffffff22; padding:2px 4px; border-radius:22px; background:var(--flow-premium-glass);
 backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); box-shadow:0 6px 20px #0002;
}
.card.player-design-immersive.theme-light .immersive-fan { --lens-surface:linear-gradient(145deg,#ffffffa0,color-mix(in srgb,var(--ma-accent) 16%,#ffffff90)); --lens-edge:#ffffffa0; }
.card.player-design-immersive[data-fan-theme="dark"] .immersive-fan { --lens-surface:linear-gradient(145deg,#555963a0,#171a22e0); }
.card.player-design-immersive[data-fan-theme="light"] .immersive-fan { --lens-surface:linear-gradient(145deg,#ffffffe0,#e8edf6c0); }
.card.player-design-immersive.performance-lite .immersive-fan .fan-lens { background:var(--homeii-surface-solid,#242832); backdrop-filter:none; -webkit-backdrop-filter:none; box-shadow:none; }
.card.compact-mode .immersive-fan:not([data-fan-style="classic"]) { height:164px; }
.card.compact-mode .immersive-fan:not([data-fan-style="classic"]) .fan-lens { width:44px!important; height:44px; }
.card.compact-mode .immersive-fan[data-fan-style="ribbon"] .fan-ribbon-rail { height:100px; }

/* The footer uses the same translucent glass in every wheel style. */
.card.player-design-immersive .immersive-fan .immersive-fan-navigation {
 background:linear-gradient(145deg,rgba(255,255,255,.16),color-mix(in srgb,var(--ma-accent) 9%,rgba(30,35,43,.34)))!important;
 border:1px solid rgba(255,255,255,.24); border-radius:22px;
 box-shadow:inset 0 1px 0 #ffffff30,0 6px 18px #0002;
 backdrop-filter:blur(28px) saturate(1.3)!important; -webkit-backdrop-filter:blur(28px) saturate(1.3)!important;
}
.card.player-design-immersive.theme-light .immersive-fan .immersive-fan-navigation,
.card.player-design-immersive[data-fan-theme="light"] .immersive-fan .immersive-fan-navigation {
 background:linear-gradient(145deg,#ffffff88,#f2f5fa66)!important; border-color:#ffffff99; box-shadow:inset 0 1px 0 #ffffffaa,0 6px 18px #0001;
}
.card.player-design-immersive .immersive-fan .immersive-fan-navigation button { font-weight:500; font-size:11px; }
.card.player-design-immersive .immersive-fan:not([data-fan-style="classic"]) .immersive-fan-actions button:focus-visible { outline:0; }
.card.player-design-immersive .immersive-fan .immersive-fan-actions button:focus-visible .fan-lens { outline:2px solid var(--ma-accent); outline-offset:4px; }
.card.player-design-immersive.performance-lite .immersive-fan .immersive-fan-navigation {
 background:var(--homeii-surface-solid,#30343c)!important; backdrop-filter:none!important; -webkit-backdrop-filter:none!important;
}
.card.player-design-immersive.performance-lite.theme-light .immersive-fan .immersive-fan-navigation { background:#f2f5fa!important; }
.listening-stats meter { inline-size:clamp(70px,24vw,180px); block-size:5px; border:0; border-radius:8px; background:color-mix(in srgb,currentColor 12%,transparent); }
.listening-stats meter::-webkit-meter-bar { background:color-mix(in srgb,currentColor 12%,transparent); border:0; border-radius:8px; }
.listening-stats meter::-webkit-meter-optimum-value { background:var(--ma-accent); border-radius:8px; }
.listening-stats meter::-moz-meter-bar { background:var(--ma-accent); border-radius:8px; }
`;
