// Opt-in player presentation. Classic selectors and playback logic remain untouched.
export const immersivePlayerStyles = `
.card.player-design-immersive:not(.compact-mode) { container-type:size; overflow:clip!important; }
:host(.mobile-edge-to-edge-open) .card.mobile-edge-to-edge { overflow:clip!important; }
:host(.mobile-edge-to-edge-open) .card.mobile-edge-to-edge.player-design-immersive .stage { overflow:clip!important; padding-top:max(12px,env(safe-area-inset-top,0px))!important; padding-bottom:max(12px,env(safe-area-inset-bottom,0px))!important; }
.card.player-design-immersive:not(.compact-mode) .stage {
  display:flex!important; flex-direction:column!important; align-items:stretch!important;
  gap:8px!important; padding:12px clamp(12px,4%,36px)!important; overflow:hidden!important;
  box-sizing:border-box; justify-content:flex-start!important;
}
.card.player-design-immersive .immersive-layout { display:grid; grid-template-columns:minmax(0,1fr); grid-template-rows:minmax(0,1fr) auto auto 64px; gap:10px; width:100%; max-width:620px; height:100%; min-height:0; margin:0 auto; box-sizing:border-box; overflow:visible; }
.immersive-header { display:flex; align-items:center; justify-content:center; }
.card.player-design-immersive .immersive-art { height:100%; width:100%; min-width:0; min-height:0; position:relative; container-type:size; display:grid; place-items:center; }
.card.player-design-immersive .immersive-metadata { text-align:center; min-width:0; }
.card.player-design-immersive .immersive-metadata #npTitle { font-size:clamp(23px,3.2cqi,32px)!important; font-weight:500!important; line-height:1.25!important; }
.card.player-design-immersive .immersive-metadata #npSub { font-size:14px!important; line-height:1.4!important; margin-top:6px; color:var(--homeii-surface-muted); }
.card.player-design-immersive .immersive-metadata :is(#npTitle,#npSub) { white-space:nowrap!important; overflow:hidden!important; text-overflow:ellipsis; }
.card.player-design-immersive :is(#mobileShuffleBtn,#mobileRepeatBtn) { display:none!important; }
.card.player-design-immersive .immersive-controls > .bottom { display:flex!important; flex-direction:column!important; gap:10px!important; width:100%!important; max-width:none!important; min-height:0!important; padding:0!important; margin:0!important; }
.card.player-design-immersive .immersive-controls .mobile-volume-inline { max-width:none; align-self:center; }
.card.player-design-immersive .immersive-layout .immersive-dock { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); align-items:center; height:64px!important; min-height:0!important; padding:0!important; max-width:none!important; align-self:center; }
.card.player-design-immersive .immersive-dock > button { justify-self:center; }

.card.player-design-immersive .immersive-dock > button { min-height:60px!important; height:60px!important; gap:4px!important; }
.card.player-design-immersive #immersiveActionsToggle > svg { padding:9px!important; }
.card.player-design-immersive .immersive-dock #activePlayerChip { min-width:0!important; max-width:100%!important; height:44px!important; min-height:44px!important; width:100%!important; align-self:center; padding:6px 10px!important; gap:8px!important; border-radius:22px!important; }
.card.player-design-immersive .immersive-player-choice > svg { width:20px!important; height:20px!important; flex:0 0 20px!important; }
.card.player-design-immersive .immersive-player-choice > .immersive-choice-chevron { width:12px!important; flex-basis:12px!important; }
.immersive-player-copy { display:flex; flex-direction:column; flex:1; min-width:0; text-align:start; gap:2px; }
.card.player-design-immersive .immersive-player-choice #selectedPlayerTitle { font-size:12px!important; white-space:nowrap!important; overflow:hidden!important; text-overflow:ellipsis; }
.card.player-design-immersive .immersive-player-choice #selectedPlayerTags { font-size:9px!important; }
.card.player-design-immersive .stage > .center { display:block!important; flex:none!important; height:auto!important; max-height:none!important; min-height:0!important; padding:0!important; width:100%!important; }
.card.player-design-immersive .hero-mobile-top { display:flex!important; justify-content:center; margin:0 0 20px!important; }
.card.player-design-immersive #activePlayerChip { display:flex!important; flex-direction:row!important; align-items:center!important; gap:12px!important; width:auto!important; min-width:180px; max-width:100%!important; min-height:52px!important; height:auto!important; padding:9px 16px!important; border:1px solid var(--homeii-surface-border)!important; border-radius:28px!important; background:color-mix(in srgb,var(--homeii-surface-text) 5%,transparent)!important; box-shadow:none!important; color:var(--homeii-surface-text)!important; }
.card.player-design-immersive #activePlayerChip::before,.card.player-design-immersive #activePlayerChip::after { display:none!important; }
.card.player-design-immersive #activePlayerChip .player-focus-art-wrap { display:none!important; }
.card.player-design-immersive #activePlayerChip .player-focus-copy { display:flex!important; flex-direction:column!important; gap:2px!important; flex:1; min-width:0; text-align:start; }
.card.player-design-immersive #selectedPlayerTags:empty { display:none!important; }
.card.player-design-immersive #selectedPlayerTitle { font-size:14px!important; font-weight:500!important; line-height:1.3!important; white-space:normal; overflow-wrap:anywhere; }
.card.player-design-immersive #selectedPlayerTags { font-size:10px!important; opacity:.75; }
.immersive-player-symbol svg { width:22px; height:22px; display:block; opacity:.85; }
.immersive-player-chevron svg { width:14px; height:14px; display:block; opacity:.55; }
.card.player-design-immersive #historyToggleFab { display:none!important; }
.card.player-design-immersive #mobileBg { inset:-8%!important; width:116%!important; height:116%!important; background-image:none!important; --homeii-bg-layer-opacity:1; background-size:cover!important; background-position:center!important; filter:blur(38px) saturate(1.55)!important; opacity:.95!important; }
.card.player-design-immersive > .shade { background:linear-gradient(180deg,rgba(9,12,17,.18),rgba(9,12,17,.48))!important; opacity:1!important; }
.card.player-design-immersive.theme-light > .shade { background:linear-gradient(180deg,rgba(250,251,252,.72),rgba(250,251,252,.88))!important; }
.card.player-design-immersive > .glow { opacity:.12!important; }
.card.player-design-immersive .hero-split-shell { display:flex!important; flex-direction:column!important; height:auto!important; min-height:0!important; gap:22px!important; width:100%!important; }
.card.player-design-immersive .hero-visual { width:100%!important; min-height:0!important; flex:none!important; }
.card.player-design-immersive .art-stage { width:min(100%,480px,40dvh)!important; height:auto!important; min-height:0!important; max-height:none!important; aspect-ratio:1; margin:auto!important; padding:0!important; }
.card.player-design-immersive :is(#npArt,.art-stack-viewport,.art-stack-container) { width:100%!important; height:100%!important; max-height:none!important; min-height:0!important; }
.card.player-design-immersive :is(.art-stack-slide.prev,.art-stack-slide.next) { width:100%!important; opacity:1!important; pointer-events:none!important; filter:none!important; }
.card.player-design-immersive .art-stack-slide.prev { transform:translateX(calc(-150% - 12px + var(--art-drag-x)))!important; }
.card.player-design-immersive .art-stack-slide.next { transform:translateX(calc(50% + 12px + var(--art-drag-x)))!important; }
.card.player-design-immersive .art-stack-slide.center { transform:translateX(calc(-50% + var(--art-drag-x)))!important; }
.card.player-design-immersive .art-stack-slide { transition:transform .3s cubic-bezier(.2,.75,.25,1)!important; will-change:transform; }
.card.player-design-immersive #npArt.cover-crossfading .art-stack-slide { transition:none!important; }
.immersive-cover-outgoing { position:absolute; inset:0; z-index:4; overflow:hidden; border-radius:inherit; pointer-events:none; }
.immersive-cover-outgoing img { display:block; width:100%; height:100%; object-fit:cover; border-radius:inherit; }
.card.player-design-immersive #npArt:is(.dragging,.resetting) .art-stack-slide { transition:none!important; }
.card.player-design-immersive .art-stack-card { width:100%!important; max-height:100%!important; transform:none!important; }
.card.player-design-immersive #npArt[aria-busy=true] { cursor:progress; }
.card.player-design-immersive #mobileMenu .menu-body.sheet-actions { scrollbar-width:none; overscroll-behavior:contain; }
.card.player-design-immersive #mobileMenu .menu-body.sheet-actions::-webkit-scrollbar { display:none; width:0; height:0; }
.card.player-design-immersive #mobileMenu .action-hub { max-width:640px; padding:4px; }
.card.player-design-immersive #mobileMenu .action-hub-section { padding:10px 2px; }
.card.player-design-immersive #mobileMenu .action-hub-grid { grid-template-columns:repeat(4,minmax(0,1fr))!important; gap:6px!important; }
.card.player-design-immersive #mobileMenu .action-hub .action-tile { min-height:72px!important; padding:4px!important; }
.card.player-design-immersive #mobileMenu .action-hub .menu-item-sub { display:none!important; }
.card.player-design-immersive #mobileMenu .action-hub .menu-item-ico { width:40px!important; height:40px!important; min-width:40px!important; flex-basis:40px!important; }
.card.player-design-immersive #mobileMenu .action-hub .menu-item-title { font-size:12px!important; line-height:1.35!important; }
.card.player-design-immersive #mobileMenu .players-premium-grid { display:grid!important; grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))!important; gap:12px!important; width:100%; max-width:760px; margin:12px auto; }
.player-choice-card { display:flex; align-items:center; gap:4px; min-width:0; border:1px solid var(--homeii-surface-border); border-radius:22px; background:color-mix(in srgb,var(--homeii-surface-text) 3%,transparent); color:var(--homeii-surface-text); }
.player-choice-card.selected { background:color-mix(in srgb,var(--homeii-surface-text) 9%,transparent); border-color:color-mix(in srgb,var(--homeii-surface-text) 35%,transparent); }
.player-choice-button { display:flex; align-items:center; gap:14px; flex:1; min-width:0; min-height:94px; border:0; background:none; color:inherit; padding:16px; font:inherit; text-align:start; cursor:pointer; border-radius:22px; }
.player-choice-details { display:flex; flex-direction:column; gap:5px; flex:1; min-width:0; }
.player-choice-name { font-size:16px; line-height:1.3; font-weight:500; overflow-wrap:anywhere; }
.player-choice-state { display:flex; align-items:center; gap:6px; font-size:11px; color:var(--homeii-surface-muted); }
.player-choice-state i { display:block; width:5px; height:5px; flex:none; border-radius:50%; background:currentColor; opacity:.6; }
.player-choice-state i.playing { background:#95c9b1; opacity:1; }
.player-choice-track { font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--homeii-surface-muted); }
.player-choice-symbol { display:grid; place-items:center; width:60px; height:60px; flex:none; border-radius:14px; overflow:hidden; background:color-mix(in srgb,currentColor 5%,transparent); }
.player-choice-symbol img { width:100%; height:100%; object-fit:cover; }
.player-choice-summary { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; max-width:760px; margin:8px auto 20px; font-size:13px; color:var(--homeii-surface-muted); }
.player-choice-summary .player-this-device-cta { min-height:58px; padding:8px 12px; border-radius:19px; border:1px solid color-mix(in srgb,var(--homeii-accent) 34%,var(--homeii-surface-border)); background:linear-gradient(135deg,color-mix(in srgb,var(--homeii-accent) 18%,transparent),color-mix(in srgb,var(--homeii-surface-text) 7%,transparent)); color:var(--homeii-surface-text); font:inherit; cursor:pointer; display:grid; grid-template-columns:40px minmax(0,1fr) 18px; align-items:center; gap:10px; text-align:start; box-shadow:0 12px 32px color-mix(in srgb,var(--homeii-accent) 12%,transparent),inset 0 1px 0 color-mix(in srgb,#fff 18%,transparent); backdrop-filter:blur(18px) saturate(135%); -webkit-backdrop-filter:blur(18px) saturate(135%); }
.player-this-device-icon { inline-size:40px; block-size:40px; border-radius:50%; display:grid; place-items:center; background:color-mix(in srgb,var(--homeii-accent) 24%,transparent); color:var(--homeii-surface-text); }
.player-this-device-icon .ui-ic { inline-size:22px; block-size:22px; }
.player-this-device-copy { min-width:0; display:grid; gap:2px; }
.player-this-device-copy strong { font-size:13px; line-height:1.25; }
.player-this-device-copy small { color:var(--homeii-surface-muted); font-size:11px; line-height:1.25; white-space:normal; }
.player-this-device-arrow { color:var(--homeii-surface-muted); font-size:24px; line-height:1; }
.player-this-device-cta:hover,.player-this-device-cta:focus-visible { border-color:color-mix(in srgb,var(--homeii-accent) 62%,var(--homeii-surface-border)); transform:translateY(-1px); }
.card.player-design-immersive .player-choice-state { display:flex!important; font-size:13px!important; line-height:1.5; opacity:1!important; }
.player-choice-symbol svg { width:22px!important; height:22px!important; }
.player-choice-check { width:18px; height:18px; flex:none; }
.player-choice-card.unavailable { opacity:.5; }
.player-choice-card .player-front-pin { position:static!important; width:40px!important; height:44px!important; flex:none; margin-inline-end:6px; background:transparent!important; border:0!important; box-shadow:none!important; }
.player-choice-card .player-front-pin svg { width:18px!important; height:18px!important; }
.player-choice-button:focus-visible { outline:2px solid currentColor; outline-offset:2px; }
.card.player-design-immersive #mobileMenu .players-action-bar { max-width:760px; margin:auto; }
.card.player-design-immersive #mobileMenu .players-action-chip { background:color-mix(in srgb,var(--homeii-surface-text) 5%,transparent)!important; border-color:var(--homeii-surface-border)!important; box-shadow:none!important; border-radius:18px!important; }
.card.player-design-immersive :is(.art-stack-slide.center,.cover-flow-slide.flow-center) { width:100%!important; max-width:100%!important; }
.card.player-design-immersive .art-stack-card { border-radius:22px!important; box-shadow:0 18px 44px #0003!important; }
.card.player-design-immersive #mobileArtShell { width:min(100cqw,100cqh,460px)!important; height:min(100cqw,100cqh,460px)!important; max-width:100%!important; max-height:100%!important; aspect-ratio:1; }
.card.player-design-immersive .hero-info { width:100%!important; max-width:560px; min-height:0!important; height:auto!important; padding:0!important; margin:auto!important; gap:0!important; }
.card.player-design-immersive .hero-copy { text-align:start!important; }
.card.player-design-immersive #npTitle { font-size:clamp(23px,4cqi,34px)!important; font-weight:500!important; letter-spacing:-.02em; line-height:1.3!important; white-space:normal!important; overflow:visible!important; display:block!important; overflow-wrap:anywhere; }
.card.player-design-immersive #npSub { font-size:15px!important; line-height:1.5!important; margin-top:6px; }
.card.player-design-immersive .mobile-action-row-wrap,
.card.player-design-immersive .night-quick-row { display:none!important; }
.card.player-design-immersive .stage > .bottom { width:100%!important; max-width:560px; margin:0 auto!important; flex:none!important; padding:0!important; gap:12px!important; }
.card.player-design-immersive .empty-quick-shelf[hidden] { display:none!important; }
.card.player-design-immersive .immersive-layout .immersive-controls .controls { display:flex!important; align-items:center!important; justify-content:center!important; gap:clamp(28px,7cqi,52px)!important; flex-wrap:nowrap!important; }
.card.player-design-immersive #btnPlay { width:76px!important; height:76px!important; min-width:76px!important; border-radius:50%!important; background:var(--homeii-surface-text,#f4f2ed)!important; color:var(--homeii-surface-solid,#17181b)!important; box-shadow:0 6px 22px #0002!important; }
.card.player-design-immersive #btnPlay svg { width:32px!important; height:32px!important; }
.card.player-design-immersive.theme-light #btnPlay { color:#fafafa!important; }
.card.player-design-immersive :is(#btnPrev,#btnNext) { width:64px!important; height:64px!important; min-width:64px!important; background:transparent!important; border:0!important; box-shadow:none!important; }
.card.player-design-immersive :is(#btnPrev,#btnNext) svg { width:40px!important; height:40px!important; }
.card.player-design-immersive .minor-btn { width:40px!important; height:44px!important; opacity:.7; background:transparent!important; border:0!important; }
.card.player-design-immersive .mobile-volume-inline { display:flex!important; align-items:center; gap:10px!important; width:100%!important; box-sizing:border-box; min-height:60px!important; padding:6px 10px!important; border:1px solid var(--homeii-surface-border); border-radius:24px; background:color-mix(in srgb,var(--homeii-surface-text) 4%,transparent); }
.card.player-design-immersive .tablet-volume-track { flex:1; min-width:40px!important; width:auto!important; }
.card.player-design-immersive #volSlider { width:100%!important; min-width:0!important; height:44px!important; margin:0!important; cursor:pointer; touch-action:pan-y; }
.card.player-design-immersive #volSlider::-webkit-slider-runnable-track { height:10px!important; border-radius:8px; }
.card.player-design-immersive #volSlider::-webkit-slider-thumb { width:24px!important; height:24px!important; margin-top:-7px!important; border:2px solid var(--homeii-surface-text)!important; border-radius:50%; box-shadow:0 2px 8px #0003!important; }
.card.player-design-immersive #volSlider::-moz-range-track { height:10px!important; border-radius:8px; }
.card.player-design-immersive #volSlider::-moz-range-thumb { width:22px!important; height:22px!important; border:2px solid var(--homeii-surface-text)!important; border-radius:50%; }
.card.player-design-immersive :is(#btnMute,#mobileVolPctLabel,.volume-step-btn) { flex:none; min-width:44px!important; min-height:44px!important; width:auto!important; height:44px!important; padding:0 4px!important; border:0!important; background:transparent!important; box-shadow:none!important; }
.card.player-design-immersive #mobileVolPctLabel { font-size:15px!important; font-weight:500; font-variant-numeric:tabular-nums; }
.card.player-design-immersive #btnMute svg { width:25px!important; height:25px!important; }
.card.player-design-immersive .progress-line { direction:ltr; display:grid!important; grid-template-columns:1fr 1fr!important; grid-template-rows:44px 18px; gap:2px 0!important; min-height:64px; width:100%; }
.card.player-design-immersive #progressBar { grid-column:1 / -1; grid-row:1; width:100%!important; min-width:0!important; position:relative; }
.card.player-design-immersive #bigCurTime { grid-column:1; grid-row:2; text-align:left; }
.card.player-design-immersive #bigTotalTime { grid-column:2; grid-row:2; text-align:right; }
.card.player-design-immersive .progress-time { width:auto!important; font-size:12px!important; font-variant-numeric:tabular-nums; color:var(--homeii-surface-muted); }
.card.player-design-immersive #progressBar { min-height:44px!important; height:44px!important; border:0!important; box-shadow:none!important; border-radius:12px!important; background:transparent!important; overflow:visible!important; display:flex; align-items:center; touch-action:none; }
.card.player-design-immersive #progressBar::before { content:""; position:absolute; inset-inline:0; top:20px; height:4px; background:color-mix(in srgb,currentColor 20%,transparent); border-radius:8px; }
.card.player-design-immersive #progressFill { height:4px!important; position:relative!important; border-radius:8px; background:linear-gradient(90deg,rgba(var(--dynamic-glow-rgb,180 180 190)/.65),rgb(var(--dynamic-glow-rgb,220 220 228)))!important; color:rgb(var(--dynamic-glow-rgb,220 220 228)); box-shadow:0 0 10px rgba(var(--dynamic-glow-rgb,180 180 190)/.12); }
.card.player-design-immersive #progressBar:is(:hover,:focus-visible,.immersive-seeking) #progressFill { height:6px!important; }
.card.player-design-immersive #progressBar:is(:hover,:focus-visible,.immersive-seeking) #progressFill::after { top:-2px; }
.card.player-design-immersive #progressFill::after { content:""; position:absolute; right:-5px; top:-3px; width:10px; height:10px; border-radius:50%; background:currentColor; }
.card.player-design-immersive #progressBar[aria-disabled=true] { opacity:.35; pointer-events:none; }
.card.player-design-immersive #progressBar[aria-disabled=true] #progressFill::after { display:none; }
.card.player-design-immersive #progressBar.has-waveform { height:44px!important; min-height:44px!important; }
.card.player-design-immersive .progress-line:has(.has-waveform) { grid-template-rows:44px 18px; }
.card.player-design-immersive #progressBar.has-waveform::before,.card.player-design-immersive #progressBar.has-waveform #progressFill { visibility:hidden; }
.immersive-waveform { position:absolute; inset:0; width:100%; height:44px; pointer-events:none; overflow:visible; }
.immersive-waveform path { fill:none; stroke-width:3; stroke-linecap:round; }
.immersive-waveform .waveform-base { stroke:color-mix(in srgb,var(--homeii-surface-text) 23%,transparent); }
.immersive-waveform .waveform-played { stroke:rgb(var(--dynamic-glow-rgb,220 220 228)); }
.immersive-seek-preview { position:absolute; bottom:30px; transform:translateX(-50%); padding:5px 9px; border-radius:10px; background:var(--homeii-surface); color:var(--homeii-surface-text); backdrop-filter:blur(24px); font:12px var(--homeii-font-family); pointer-events:none; }
#immersiveLiveStatus { font-size:11px; letter-spacing:.12em; }
.card.player-design-immersive .progress-line.immersive-no-duration :is(#bigCurTime,#bigTotalTime) { visibility:hidden; }
.card.player-design-immersive .progress-line.immersive-live #progressBar { display:none; }
.card.player-design-immersive .progress-line.immersive-live #immersiveLiveStatus { grid-column:1 / -1; grid-row:1 / 3; align-self:center; text-align:center; color:var(--homeii-surface-text); }
.card.player-design-immersive .immersive-dock { position:relative; display:flex; justify-content:space-between; width:100%; max-width:560px; margin:0 auto; padding:4px 0; flex:none; z-index:12; }
.immersive-dock button { font:inherit; cursor:pointer; color:inherit; }
.immersive-dock > button { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:7px; width:76px; min-height:64px; border:0; border-radius:24px; background:transparent; font-size:11px; }
.immersive-dock svg { width:24px; height:24px; flex:none; }
.immersive-library-shortcuts { display:flex;align-items:center;justify-content:center;gap:2px;min-width:0; }
.immersive-library-shortcuts button { display:grid;place-items:center;min-width:44px;min-height:44px;padding:8px;border:0;border-radius:50%;background:transparent; }
#immersiveActionsToggle > svg { fill:none; padding:12px; box-sizing:content-box; border:1px solid var(--homeii-surface-border); border-radius:50%; background:var(--homeii-surface); }
#immersiveActionsToggle[aria-expanded=true] > svg { background:color-mix(in srgb,currentColor 15%,transparent); }
/* The wheel is anchored to the existing dock; player geometry stays untouched. */
.immersive-fan { position:absolute; bottom:calc(100% + 8px); left:50%; width:min(440px,100%); height:228px; box-sizing:border-box; transform:translateX(-50%); display:block; padding:0; border:1px solid var(--homeii-surface-border); border-radius:50% 50% 24px 24px / 78% 78% 24px 24px; color:var(--homeii-surface-text); touch-action:none; user-select:none; -webkit-user-select:none; overflow:hidden; isolation:isolate; transform-origin:50% 100%; }
.immersive-fan-actions { position:absolute; inset:0; direction:ltr; }
.immersive-fan .immersive-fan-actions button { position:absolute; left:0; top:0; width:var(--fan-item-size,56px); min-width:44px; min-height:66px; height:auto; padding:7px 0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:7px; border:0; border-radius:18px; background:transparent; color:inherit; font:500 12px/1.3 var(--homeii-font-family); touch-action:none; transform:translate3d(calc(var(--fan-x) - 50%),var(--fan-y),0) scale(var(--fan-depth,1)); transition:background .14s ease,color .14s ease; }
.immersive-fan-actions button > svg { width:25px; height:25px; flex-shrink:0; }
.immersive-fan-actions button > span:not(.fan-player-art) { width:max-content; max-width:72px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; white-space:normal; direction:inherit; overflow-wrap:normal; }
.immersive-fan-actions button.fan-center { background:color-mix(in srgb,currentColor 7%,transparent); }
.immersive-fan.rotating .immersive-fan-actions button,.immersive-fan.coasting .immersive-fan-actions button { will-change:transform,opacity; transition:none; }
.immersive-fan-actions button:is(:hover,:focus-visible) { background:color-mix(in srgb,var(--ma-accent) 15%,transparent); }
.immersive-fan-actions button[aria-pressed="true"] { color:var(--ma-accent); }
.immersive-fan-actions button[aria-pressed="true"]::after { content:""; width:4px; height:4px; background:currentColor; border-radius:50%; position:absolute; bottom:0; }
.immersive-fan-navigation { position:absolute; bottom:6px; inset-inline:12px; min-height:44px; display:grid; grid-template-columns:44px minmax(0,1fr) auto 44px; align-items:center; gap:3px; border-top:1px solid var(--homeii-surface-border); padding-top:6px; }
.immersive-fan .immersive-fan-navigation button { display:grid; place-items:center; min-height:44px; min-width:44px; padding:5px 7px; border:0; background:transparent; color:inherit; font:500 12px/1.3 var(--homeii-font-family); border-radius:12px; }
.immersive-fan-navigation button svg { width:18px; height:18px; }
.immersive-fan-navigation button:is(:hover,:focus-visible) { background:color-mix(in srgb,currentColor 7%,transparent); }
.immersive-fan-navigation:has([data-player-screen]) { grid-template-columns:44px minmax(0,1fr) auto 44px 44px; }
.immersive-fan-navigation:has([data-player-screen]) button { min-width:44px; padding-inline:3px; }
.immersive-page-status { display:flex; flex-direction:column; align-items:center; gap:2px; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font:500 12px/1.3 var(--homeii-font-family); color:inherit; text-align:center; }
.immersive-page-status::after { content:attr(data-position); font-size:10px; font-weight:400; color:var(--homeii-surface-muted); direction:ltr; font-variant-numeric:tabular-nums; }
.immersive-fan button:disabled { opacity:.35; cursor:default; }
.immersive-fan[hidden] { display:none!important; }
.immersive-fan.fan-pulling { overflow:visible; }
.immersive-fan.fan-pulling .immersive-fan-actions button:not(.fan-pull-item) { opacity:calc(1 - var(--fan-pull-progress,0) * .7)!important; }
.immersive-fan .immersive-fan-actions button.fan-pull-item { translate:0 var(--fan-pull-y,0px); z-index:2; background:var(--homeii-surface); box-shadow:0 8px 24px #0002; }
.immersive-fan .immersive-fan-actions button.fan-pull-ready { color:var(--ma-accent); box-shadow:0 0 0 1px color-mix(in srgb,var(--ma-accent) 45%,transparent),0 8px 24px #0002; }
@media (prefers-reduced-motion:no-preference) {
  .immersive-fan.fan-opening { animation:homeii-fan-reveal .36s cubic-bezier(.16,1,.3,1) both; }
  .immersive-fan.fan-opening .immersive-fan-actions button { animation:homeii-fan-unfold .34s cubic-bezier(.16,1,.3,1) var(--fan-delay,0ms) backwards; }
  .immersive-fan.fan-opening .immersive-fan-navigation { animation:homeii-fan-footer .25s .12s ease both; }
  .immersive-fan.fan-closing { animation:homeii-fan-dismiss .22s ease-out both; pointer-events:none; }
  .card:not(.performance-lite) button > svg[data-icon="fan"] { transition:rotate .38s cubic-bezier(.2,.7,.2,1); }
  .card:not(.performance-lite) button[aria-expanded="true"] > svg[data-icon="fan"] { rotate:-32deg; }
  .card.player-design-immersive:not(.performance-lite) :is(.immersive-dock,.screen-dock,.immersive-transport) > button { transition:scale .18s ease,background .18s ease; }
  .card.player-design-immersive:not(.performance-lite) :is(.immersive-dock,.screen-dock,.immersive-transport) > button:active { scale:.94; }
  .card.player-design-immersive:not(.performance-lite) :is(#btnPrev,#btnPlay,#btnNext) { transition:scale .18s ease,background .18s ease; }
  .card.player-design-immersive:not(.performance-lite) :is(#btnPrev,#btnPlay,#btnNext):active { scale:.96; }
  @keyframes homeii-fan-reveal { from { opacity:0; clip-path:ellipse(4% 2% at 50% 100%); transform:translateX(-50%) scale(.94); } to { opacity:1; clip-path:ellipse(110% 110% at 50% 100%); transform:translateX(-50%) scale(1); } }
  @keyframes homeii-fan-unfold { from { opacity:0; transform:translate3d(calc(var(--fan-origin-x) - 50%),var(--fan-origin-y),0) rotate(var(--fan-angle)) scale(.45); } to { transform:translate3d(calc(var(--fan-x) - 50%),var(--fan-y),0) scale(var(--fan-depth,1)); } }
  @keyframes homeii-fan-footer { from { opacity:0; translate:0 5px; } to { opacity:1; translate:0 0; } }
  @keyframes homeii-fan-dismiss { to { opacity:0; filter:blur(5px); transform:translateX(-50%) translateY(-5px) scale(1.025); } }
}

.immersive-dock button:focus-visible { outline:2px solid currentColor; outline-offset:3px; }
.card.player-design-immersive .mobile-brand-signature { display:none!important; }
.card.player-design-immersive .immersive-controls { min-width:0; }
.card.player-design-immersive .immersive-layout .immersive-dock { border-top:1px solid var(--homeii-surface-border); background:color-mix(in srgb,var(--homeii-surface-solid) 30%,transparent); border-radius:0 0 22px 22px; backdrop-filter:none; -webkit-backdrop-filter:none; }
.card.player-design-immersive .immersive-dock #activePlayerChip { border:0!important; background:transparent!important; border-radius:0!important; padding:0!important; justify-content:center!important; }
.card.player-design-immersive .immersive-dock .immersive-player-copy { flex:0 1 auto; max-width:78px; }
.card.player-design-immersive .immersive-dock #selectedPlayerTags { display:none!important; }
.card.player-design-immersive .immersive-dock > button > svg { width:25px!important; height:25px!important; flex-basis:25px!important; }
.card.player-design-immersive #immersiveActionsToggle > svg { border:0; background:transparent; padding:0!important; border-radius:14px; }
@container (max-width:320px) { .immersive-fan { width:100%; } .immersive-fan .immersive-fan-actions button { font-size:12px; } }
@media(prefers-reduced-motion:no-preference) { .card.player-design-immersive #progressBar:not(.immersive-seeking) #progressFill { transition:width .8s linear,height .15s ease; } }
@media(prefers-reduced-motion:reduce) {
  .card.player-design-immersive .art-stack-slide,
  .immersive-fan,.immersive-fan-actions,.immersive-fan-actions button,
  .card.player-design-immersive #progressFill { transition:none!important; animation:none!important; }
}
@container (max-height:560px) {
  .card.player-design-immersive .immersive-layout { grid-template-rows:minmax(0,1fr) auto auto 52px; gap:6px; }
  .card.player-design-immersive #activePlayerChip { min-height:44px!important; padding:5px 12px!important; }
  .card.player-design-immersive #btnPlay { width:60px!important; height:60px!important; min-width:60px!important; }
  .card.player-design-immersive .immersive-controls > .bottom { gap:4px!important; }
  .card.player-design-immersive .mobile-volume-inline { min-height:48px!important; padding:0 8px!important; }
  .card.player-design-immersive .immersive-layout .immersive-dock { height:52px!important; }
  .card.player-design-immersive .immersive-dock > button { height:52px!important; min-height:44px!important; }
  .card.player-design-immersive #immersiveActionsToggle > svg { padding:4px!important; }
}
@container (max-height:400px) {
  .card.player-design-immersive .immersive-art { display:none; }
  .card.player-design-immersive .immersive-layout { grid-template-rows:auto auto 44px; gap:4px; }
  .card.player-design-immersive .immersive-metadata #npTitle { font-size:18px!important; }
  .card.player-design-immersive .immersive-metadata #npSub { font-size:12px!important; margin-top:2px; }
  .card.player-design-immersive #btnPlay { width:48px!important; height:48px!important; min-width:48px!important; }
  .card.player-design-immersive .immersive-dock > button > span { display:none; }
}

/* Compact player uses the same dock and actions with its own density. */
.card.compact-mode.compact-mode .compact-content { display:grid!important; grid-template-columns:minmax(100px,34%) minmax(0,1fr)!important; grid-template-rows:88px 64px 12px 26px 12px 48px!important; grid-template-areas:"cover copy" "cover controls" ". ." "progress progress" ". ." "dock dock"!important; gap:0 16px!important; align-content:center!important; }
.card.compact-mode.compact-mode .compact-stage { display:contents!important; }
.card.compact-mode.compact-mode .compact-cover-wrap { grid-area:cover; width:min(100%,152px)!important; height:auto!important; aspect-ratio:1; max-width:152px; justify-self:center!important; }
.card.compact-mode.compact-mode .compact-cover { width:100%!important; height:100%!important; padding:0!important; border:0!important; box-shadow:none!important; border-radius:18px!important; }
.card.compact-mode.compact-mode .compact-cover-image { object-fit:cover; padding:0!important; }
.card.compact-mode.compact-mode .compact-cover-echo,.card.compact-mode.compact-mode .compact-brand-signature,.card.compact-mode.compact-mode .compact-up-next { display:none!important; }
.card.compact-mode.compact-mode .compact-main { grid-area:copy; min-width:0; padding:0!important; }
.card.compact-mode.compact-mode .compact-title { font-size:clamp(18px,2.5vw,26px)!important; line-height:1.2!important; }
.card.compact-mode.compact-mode .compact-sub { font-size:13px!important; line-height:1.4!important; }
.card.compact-mode.compact-mode .compact-controls { grid-area:controls; gap:18px!important; margin:0!important; justify-content:center!important; }
.card.compact-mode.compact-mode .compact-controls button { width:44px!important; height:44px!important; min-width:44px!important; min-height:44px!important; }
.card.compact-mode.compact-mode .compact-controls .main-btn { width:52px!important; height:52px!important; }
.card.compact-mode.compact-mode .compact-controls svg { width:26px!important; height:26px!important; }
.card.compact-mode.compact-mode .compact-progress-row { display:flex!important; grid-area:progress; gap:8px; align-items:center; width:100%; height:26px!important; margin:0!important; padding:0!important; }
.card.compact-mode.compact-mode .compact-progress-track { flex:1; min-width:0; height:24px; cursor:pointer; }
.card.compact-mode.compact-mode .compact-progress-time { font-size:10px; font-variant-numeric:tabular-nums; }
.card.compact-mode.compact-mode .compact-volume-inline { grid-area:volume; width:100%!important; min-width:0; gap:4px!important; margin:0!important; }
.card.compact-mode.compact-mode .compact-volume-track { min-width:0!important; }
.card.compact-mode.compact-mode .compact-content > .immersive-dock { grid-area:dock; display:flex!important; align-items:center; height:48px!important; padding:0!important; max-width:none; border-top:1px solid var(--homeii-surface-border); }
.card.compact-mode.compact-mode .immersive-dock > button { height:44px!important; min-height:44px!important; width:44px; border-radius:12px; }
.card.compact-mode.compact-mode .immersive-library-shortcuts { display:flex!important; order:1; }
.card.compact-mode.compact-mode .immersive-library-shortcuts [data-immersive-search] { display:none; }
.card.compact-mode.compact-mode #mobileVolPctLabel { order:2; }
.card.compact-mode.compact-mode #compactExpandBtn { order:3; }
.card.compact-mode.compact-mode .immersive-dock #activePlayerChip { flex:1; max-width:55%!important; width:auto!important; flex-direction:row; background:transparent!important; box-shadow:none!important; }
.card.compact-mode.compact-mode .immersive-player-copy { min-width:0; }
.card.compact-mode.compact-mode #selectedPlayerTitle { font-size:12px; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.card.compact-mode.compact-mode #selectedPlayerTags { display:none; }
.card.compact-mode.compact-mode .immersive-fan { height:154px; bottom:100%; width:min(400px,100%); border-radius:50% 50% 16px 16px / 65% 65% 16px 16px; }
.card.compact-mode.compact-mode .immersive-fan .immersive-fan-actions button { width:var(--fan-item-size,54px); min-height:54px; font-size:11px; }
.card.compact-mode.compact-mode .immersive-fan-navigation { height:36px; }
.card.theme-light.compact-mode.compact-mode .compact-volume-inline button { color:#20252b!important; background:transparent!important; }

.card.compact-mode.compact-mode .compact-shell { box-sizing:border-box!important; padding:4px 16px!important; min-height:244px!important; height:auto!important; }
.card.compact-mode.compact-mode .compact-content { height:auto!important; min-height:0!important; margin:auto!important; align-items:center!important; }
.card.compact-mode.compact-mode .compact-main { align-self:center!important; }
.card.compact-mode.compact-mode .compact-cover-wrap { align-self:center!important; }
.card.compact-mode.compact-mode #btnPlay { width:52px!important; height:52px!important; min-width:52px!important; min-height:52px!important; max-height:52px!important; padding:0!important; }
.card.compact-mode.compact-mode #btnPrev,.card.compact-mode.compact-mode #btnNext { width:44px!important; height:44px!important; min-width:44px!important; min-height:44px!important; padding:0!important; }
.card.compact-mode.compact-mode #btnPlay svg { width:24px!important; height:24px!important; }
.card.compact-mode.compact-mode #progressBar { height:26px!important; min-height:26px!important; position:relative!important; }
.card.compact-mode.compact-mode .immersive-waveform { height:26px!important; overflow:hidden; }
.card.compact-mode.compact-mode .immersive-dock { box-sizing:border-box; border-radius:16px; padding:2px 6px!important; background:rgba(128,128,128,.08); margin:0!important; }
.card.compact-mode.compact-mode .immersive-dock #activePlayerChip { order:-1; max-width:48%!important; min-width:0!important; }
.card.compact-mode.compact-mode .immersive-dock #mobileVolPctLabel { width:52px!important; font-size:12px!important; font-variant-numeric:tabular-nums; }
.card.compact-mode.compact-mode .compact-title { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

.card.compact-mode.compact-collapsed { height:272px!important; min-height:272px!important; max-height:272px!important; }
.card.compact-mode.compact-collapsed .stage { box-sizing:border-box!important; height:272px!important; padding:6px!important; align-items:center!important; }
.card.compact-mode.compact-mode .compact-shell { height:260px!important; max-height:260px!important; align-self:center!important; }
.card.compact-mode.compact-mode .compact-content { width:100%!important; max-width:none!important; }
.card.compact-mode.compact-mode #compactExpandBtn svg,
.card.compact-expanded.compact-expanded #compactCollapseBtn svg { width:18px!important; height:18px!important; }
`;
