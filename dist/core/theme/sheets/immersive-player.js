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
.card.player-design-immersive #mobileBg { inset:-8%!important; width:116%!important; height:116%!important; background-image:var(--homeii-bg-art-current)!important; background-size:cover!important; background-position:center!important; filter:blur(38px) saturate(1.55)!important; opacity:.95!important; }
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
.card.player-design-immersive .art-stack-slide { transition:transform .16s cubic-bezier(.2,.75,.25,1)!important; will-change:transform; }
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
.player-choice-summary button { min-height:44px; padding:8px 14px; border-radius:16px; border:1px solid var(--homeii-surface-border); background:transparent; color:var(--homeii-surface-text); font:inherit; cursor:pointer; }
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
.card.player-design-immersive .progress-line { direction:ltr; display:grid!important; grid-template-columns:1fr 1fr!important; grid-template-rows:28px 18px; gap:2px 0!important; min-height:48px; width:100%; }
.card.player-design-immersive #progressBar { grid-column:1 / -1; grid-row:1; width:100%!important; min-width:0!important; position:relative; }
.card.player-design-immersive #bigCurTime { grid-column:1; grid-row:2; text-align:left; }
.card.player-design-immersive #bigTotalTime { grid-column:2; grid-row:2; text-align:right; }
.card.player-design-immersive .progress-time { width:auto!important; font-size:12px!important; font-variant-numeric:tabular-nums; color:var(--homeii-surface-muted); }
.card.player-design-immersive #progressBar { min-height:24px!important; height:24px!important; border:0!important; box-shadow:none!important; border-radius:12px!important; background:transparent!important; overflow:visible!important; display:flex; align-items:center; touch-action:none; }
.card.player-design-immersive #progressBar::before { content:""; position:absolute; inset-inline:0; top:10px; height:4px; background:color-mix(in srgb,currentColor 20%,transparent); border-radius:8px; }
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
#immersiveActionsToggle > svg { fill:none; padding:12px; box-sizing:content-box; border:1px solid var(--homeii-surface-border); border-radius:50%; background:var(--homeii-surface); }
#immersiveActionsToggle[aria-expanded=true] > svg { background:color-mix(in srgb,currentColor 15%,transparent); }
.immersive-fan { position:absolute; bottom:calc(100% + 8px); left:50%; width:min(440px,100%); height:220px; box-sizing:border-box; transform:translateX(-50%); display:block; padding:0 12px 6px; border:1px solid var(--homeii-surface-border); border-radius:50% 50% 18px 18px / 94% 94% 18px 18px; background:rgba(20,22,26,.84); backdrop-filter:blur(48px) saturate(.85); -webkit-backdrop-filter:blur(48px) saturate(.85); box-shadow:0 16px 48px #0004,inset 0 1px 0 #ffffff12; color:var(--homeii-surface-text); touch-action:pan-y; }
.theme-light .immersive-fan { background:rgba(250,251,252,.86); }
.immersive-fan { touch-action:none; user-select:none; -webkit-user-select:none; overflow:hidden; }
.immersive-fan-actions { transform-origin:50% 100%; transform:rotate(var(--fan-rotation,0deg)); transition:transform .2s cubic-bezier(.2,.8,.2,1); }
.immersive-fan.rotating .immersive-fan-actions,.immersive-fan.rotating .immersive-fan-actions button { transition:none!important; }
.immersive-fan-actions { position:absolute; inset:0 10px 44px; }
.immersive-fan .immersive-fan-actions button { position:absolute; left:var(--fan-x); top:var(--fan-y); transform:translateX(-50%) rotate(calc(-1 * var(--fan-rotation,0deg))); transition:left .18s ease-out,top .18s ease-out,opacity .12s; width:62px; min-height:64px; height:auto; padding:4px 0; border-radius:24px; gap:6px; font-size:11px; touch-action:none; }
.immersive-fan-actions button svg { width:28px; height:28px; }
.immersive-fan-navigation { position:absolute; bottom:4px; inset-inline:22px; display:flex; align-items:center; justify-content:space-between; gap:6px; margin-top:0; border-top:1px solid var(--homeii-surface-border); }
.immersive-fan .immersive-fan-navigation button { min-height:44px; min-width:44px; padding:4px 8px; font-size:12px; }
.immersive-page-status { font-size:11px; color:var(--homeii-surface-muted); direction:ltr; }
.immersive-fan button:disabled { opacity:.35; cursor:default; }
.immersive-fan[hidden] { display:none!important; }
.immersive-fan button { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; min-height:72px; min-width:0; border:0; border-radius:18px; background:transparent; font-size:12px; }
.immersive-fan button:is(:hover,:focus-visible) { background:color-mix(in srgb,currentColor 9%,transparent); }
.immersive-dock button:focus-visible { outline:2px solid currentColor; outline-offset:3px; }
.card.player-design-immersive .mobile-brand-signature { display:none!important; }
.card.player-design-immersive .immersive-controls { min-width:0; }
.card.player-design-immersive .immersive-layout .immersive-dock { border-top:1px solid var(--homeii-surface-border); background:color-mix(in srgb,var(--homeii-surface-solid) 30%,transparent); border-radius:0 0 22px 22px; backdrop-filter:none; -webkit-backdrop-filter:none; }
.card.player-design-immersive .immersive-dock #activePlayerChip { border:0!important; background:transparent!important; border-radius:0!important; padding:0!important; justify-content:center!important; }
.card.player-design-immersive .immersive-dock .immersive-player-copy { flex:0 1 auto; max-width:78px; }
.card.player-design-immersive .immersive-dock #selectedPlayerTags { display:none!important; }
.card.player-design-immersive .immersive-dock > button > svg { width:25px!important; height:25px!important; flex-basis:25px!important; }
.card.player-design-immersive #immersiveActionsToggle > svg { border:0; background:transparent; padding:9px!important; border-radius:14px; }
@container (max-width:320px) { .immersive-fan { width:100%; } .immersive-fan .immersive-fan-actions button { width:52px; font-size:10px; } }
@media(prefers-reduced-motion:no-preference) { .immersive-fan:not([hidden]) { animation:homeii-fan-enter .18s ease-out; } @keyframes homeii-fan-enter { from { opacity:0; transform:translate(-50%,6px); } to { opacity:1; transform:translate(-50%,0); } } }
@media(prefers-reduced-motion:no-preference) { .card.player-design-immersive #progressBar:not(.immersive-seeking) #progressFill { transition:width .8s linear,height .15s ease; } }
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
`;
