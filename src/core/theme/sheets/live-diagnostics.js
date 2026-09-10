export const liveDiagnosticsStyles = `
.card.player-design-immersive .diagnostics-shell { width:100%; max-width:1100px; margin-inline:auto; padding:clamp(12px,3vw,28px); box-sizing:border-box; font-family:var(--homeii-font-family); color:var(--homeii-surface-text); }
.card.player-design-immersive .diagnostics-shell h2 { margin:0 0 8px; font:500 clamp(20px,3vw,28px)/1.4 var(--homeii-font-family); }
.card.player-design-immersive .diagnostics-shell > p { color:var(--homeii-surface-muted); font-size:14px; line-height:1.6; }
.card.player-design-immersive .diagnostics-list { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr)); gap:12px; margin-block:20px; }
.card.player-design-immersive .diagnostic-row { display:flex; align-items:flex-start; gap:14px; min-height:82px; padding:18px; border:1px solid var(--homeii-surface-border); border-radius:22px; background:color-mix(in srgb,var(--homeii-surface) 55%,transparent); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); box-sizing:border-box; }
.card.player-design-immersive .diagnostic-status { flex:none; width:10px; height:10px; margin-top:7px; border:0; border-radius:50%; background:#a3a9b3; color:#a3a9b3; box-shadow:0 0 0 4px color-mix(in srgb,currentColor 12%,transparent); }
.card.player-design-immersive .diagnostic-status svg { display:none; }
.card.player-design-immersive .status-ok .diagnostic-status { background:#42bf87; color:#42bf87; }
.card.player-design-immersive .status-warn .diagnostic-status { background:#e7af49; color:#e7af49; }
.card.player-design-immersive .status-fail .diagnostic-status { background:#ed7272; color:#ed7272; }
.card.player-design-immersive .diagnostic-copy { min-width:0; }
.card.player-design-immersive .diagnostic-title { font:500 15px/1.5 var(--homeii-font-family); color:var(--homeii-surface-text); }
.card.player-design-immersive .diagnostic-detail,.card.player-design-immersive .diagnostic-value { margin-top:5px; font:400 13px/1.6 var(--homeii-font-family); color:var(--homeii-surface-muted); overflow-wrap:anywhere; }
`;
