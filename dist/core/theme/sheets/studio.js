// studio styles. Order is preserved by card-styles.js.
export default function() {
  return `.card.layout-tablet .menu-backdrop{justify-content:center!important;align-items:stretch!important;padding:var(--flow-sheet-pad-block) var(--flow-sheet-pad-inline)!important;}
.card.layout-tablet .menu-sheet{width:min(calc(100% - var(--flow-sheet-gutter)), 920px)!important;max-width:min(calc(100% - var(--flow-sheet-gutter)), 920px)!important;max-height:calc(100% - 26px)!important;height:calc(100% - 26px)!important;margin-inline:auto!important;}
.card.layout-tablet .menu-sheet.sheet-library,.card.layout-tablet .menu-sheet.sheet-search{width:min(calc(100% - var(--flow-sheet-gutter)), 1120px)!important;max-width:min(calc(100% - var(--flow-sheet-gutter)), 1120px)!important;}
.card.layout-tablet .menu-sheet.sheet-queue{width:min(calc(100% - var(--flow-sheet-queue-gutter)), 980px)!important;max-width:min(calc(100% - var(--flow-sheet-queue-gutter)), 980px)!important;}
.card.layout-tablet .menu-sheet.sheet-actions,.card.layout-tablet .menu-sheet.sheet-schedules,.card.layout-tablet .menu-sheet.sheet-players,.card.layout-tablet .menu-sheet.sheet-groupplayers,.card.layout-tablet .menu-sheet.sheet-settings{width:min(calc(100% - var(--flow-sheet-narrow-gutter)), 860px)!important;max-width:min(calc(100% - var(--flow-sheet-narrow-gutter)), 860px)!important;}
.card.layout-tablet .queue-list{max-width:920px;margin-inline:auto;}
.card.layout-tablet .queue-row{min-height:88px!important;}
.card.layout-tablet .active-player-chip .bars,.card.layout-tablet .active-player-card .bars{display:none!important;}
.card.layout-tablet.rtl,.card.layout-tablet.rtl button,.card.layout-tablet.rtl input,.card.layout-tablet.rtl textarea,.card.layout-tablet.rtl select{font-family:var(--homeii-font-family)!important;}
.card.layout-tablet.rtl .hero-title,.card.layout-tablet.rtl .menu-title,.card.layout-tablet.rtl .player-premium-name,.card.layout-tablet.rtl .player-premium-kicker,.card.layout-tablet.rtl .settings-label,.card.layout-tablet.rtl .menu-item-title{font-family:var(--homeii-font-family)!important;}
.card.layout-tablet.rtl .players-premium-grid{direction:ltr!important;}
.card.layout-tablet.rtl .player-menu-card{direction:ltr!important;text-align:start!important;}
.card.layout-tablet.rtl .player-premium-head{grid-template-columns:64px minmax(0,1fr)!important;}
.card.layout-tablet .player-menu-card{min-height:142px!important;padding:20px 16px 10px!important;gap:8px!important;}
.card.layout-tablet .player-premium-head{padding:10px 50px 0 0!important;}
.card.layout-tablet .player-premium-side{top:10px!important;right:12px!important;left:auto!important;}
.card.layout-tablet .player-front-pin{width:27px!important;height:27px!important;}
.card.layout-tablet .player-front-pin .ui-ic{width:17px!important;height:17px!important;}
.card.layout-tablet .player-volume-row{min-height:34px!important;padding:2px 6px!important;gap:8px!important;grid-template-columns:26px minmax(0,1fr) 36px!important;border-radius:14px!important;}
.card.layout-tablet .player-mini-mute{width:26px!important;height:26px!important;border-radius:10px!important;}
.card.layout-tablet .player-mini-mute .ui-ic{width:13px!important;height:13px!important;}
.card.layout-tablet .player-mini-volume{height:5px!important;}
.card.layout-tablet .player-mini-volume::-webkit-slider-thumb{width:11px!important;height:11px!important;}
.card.layout-tablet .player-mini-volume::-moz-range-thumb{width:11px!important;height:11px!important;}
.card.layout-tablet .player-mini-value{min-width:34px!important;font-size:11px!important;font-weight:800!important;}
.card.layout-tablet.rtl .player-premium-copy{direction:rtl;text-align:right;}
.card.layout-tablet.rtl .player-volume-row{grid-template-columns:26px minmax(0,1fr) 36px!important;}
.card.layout-tablet.rtl .player-mini-value{text-align:end!important;}
.theme-light .player-menu-card{color:#1f2633!important;}
.theme-light .player-premium-name{color:#16202d!important;}
.theme-light .player-premium-kicker{color:#6c7889!important;}
.theme-light .player-premium-track{color:#556276!important;}
.theme-light .player-premium-meta{color:#5c687b!important;}
.theme-light .player-mini-value{color:#435066!important;}
.control-room-backdrop{position:absolute;inset:0;display:flex;align-items:stretch;justify-content:center;padding:0;opacity:0;pointer-events:none;transition:opacity .26s ease;z-index:28;background:rgba(6,10,18,.12);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);}
.control-room-backdrop.open{opacity:1;pointer-events:auto;}
.card:not(.control-room-open) > .control-room-backdrop{opacity:0!important;pointer-events:none!important;}
.control-room-shell{position:relative;width:100%;height:100%;min-height:100%;max-height:none;display:block;border-radius:inherit;overflow:hidden;border:none;background:transparent;box-shadow:none;}
.theme-light .control-room-shell{background:transparent;}
.control-room-head{position:absolute;inset-inline:0;inset-block-start:0;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 22px;z-index:48;pointer-events:none;}
.control-room-head-brand{width:var(--flow-control-room-brand-width);color:rgba(255,255,255,.68);opacity:.96;display:grid;place-items:center;pointer-events:none;}
.theme-light .control-room-head-brand{color:rgba(31,38,51,.42);}
.control-room-close{width:46px;height:46px;border-radius:18px;border:1px solid rgba(255,255,255,.14);background:rgba(10,13,20,.34);color:#fff;display:grid;place-items:center;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);pointer-events:auto;z-index:49;}
.theme-light .control-room-close{border-color:rgba(26,39,61,.1);background:rgba(255,255,255,.62);color:#1b2740;}
.control-room-close .ui-ic{width:18px;height:18px;}
.control-room-body-host{position:absolute;inset:0;overflow:hidden;padding:0;display:block;}
.control-room-scene{position:relative;height:100%;min-height:0;width:100%;padding:var(--control-room-head-reserve, 74px) 18px 0;display:grid;overflow:hidden;box-sizing:border-box;}
.control-room-scene-bg,.control-room-scene-glow{position:absolute;inset:0;pointer-events:none;}
.control-room-scene-bg{background:
  radial-gradient(circle at 18% 18%, rgba(var(--dynamic-accent-rgb,245 166 35) / .24), transparent 28%),
  radial-gradient(circle at 84% 16%, rgba(var(--dynamic-glow-rgb,255 175 92) / .18), transparent 24%),
  linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.01));
  filter:blur(16px);
  transform:scale(1.08);
  animation:control-room-scene-drift 28s ease-in-out infinite alternate;}
.control-room-scene.has-art .control-room-scene-bg{background:
  radial-gradient(circle at 16% 18%, rgba(var(--dynamic-accent-rgb,245 166 35) / .32), transparent 26%),
  radial-gradient(circle at 82% 18%, rgba(var(--dynamic-glow-rgb,255 175 92) / .24), transparent 24%),
  linear-gradient(180deg, rgba(7,10,17,.08), rgba(7,10,17,.22) 34%, rgba(7,10,17,.68) 100%),
  var(--control-room-scene-art) center/cover no-repeat;
  filter:saturate(1.08) blur(18px);
  opacity:.94;
  transform:scale(1.14);
  animation:control-room-scene-drift 32s ease-in-out infinite alternate;}
.control-room-scene-glow{background:
  radial-gradient(circle at 22% 22%, rgba(var(--dynamic-accent-rgb,245 166 35) / .28), transparent 28%),
  radial-gradient(circle at 76% 62%, rgba(var(--dynamic-glow-rgb,255 175 92) / .18), transparent 30%),
  radial-gradient(circle at 52% 78%, rgba(var(--dynamic-accent-rgb,245 166 35) / .12), transparent 34%),
  linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,0));
  mix-blend-mode:screen;opacity:.88;animation:control-room-glow-breathe 22s ease-in-out infinite;}
.theme-light .control-room-scene-glow{opacity:.58;}
.control-room-scene.panel-open .control-room-scene-bg,
.control-room-scene.panel-open .control-room-scene-glow{animation:none!important;transform:none!important;}
.control-room-scene.panel-open .control-room-scene-bg{filter:blur(12px) saturate(.92)!important;}
.control-room-scene.panel-open .control-room-tray{background:rgba(21,22,28,.92);backdrop-filter:none;-webkit-backdrop-filter:none;}
.theme-light .control-room-scene.panel-open .control-room-tray{background:rgba(250,252,255,.96);}
.control-room-layout{position:relative;z-index:1;height:100%;min-height:0;display:grid;grid-template-rows:minmax(0,1fr) auto;gap:8px;overflow:hidden;box-sizing:border-box;}
.control-room-grid-wrap{min-height:0;height:100%;max-height:100%;padding:4px 14px 0;overflow:hidden;display:grid;place-items:start center;align-content:start;overscroll-behavior:contain;box-sizing:border-box;}
.control-room-grid{width:100%;max-width:min(var(--control-room-grid-max-width, 100%), 100%);max-height:min(var(--control-room-grid-max-height, 100%), var(--control-room-grid-available-height, 100%));display:grid;grid-template-columns:repeat(var(--control-room-cols, 3), minmax(0,1fr));gap:var(--control-room-gap, 18px);align-content:start;justify-content:stretch;justify-items:stretch;margin-inline:auto;grid-auto-rows:max-content;overflow:visible;box-sizing:border-box;}
.control-room-tile{position:relative;width:100%;aspect-ratio:16 / 9;display:grid;grid-template-rows:minmax(0,1fr) auto;gap:calc(10px * var(--control-room-tile-scale, 1));padding:calc(16px * var(--control-room-tile-scale, 1)) calc(16px * var(--control-room-tile-scale, 1)) calc(14px * var(--control-room-tile-scale, 1));border-radius:clamp(20px, calc(30px * var(--control-room-tile-scale, 1)), 30px);overflow:hidden;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);box-shadow:0 20px 44px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.12);transition:border-color .14s ease,box-shadow .14s ease,opacity .14s ease;transform:none;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);contain:layout paint;}
.control-room-tile:hover{border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .28);box-shadow:0 20px 44px rgba(0,0,0,.22),0 0 0 1px rgba(var(--dynamic-accent-rgb,245 166 35) / .1),inset 0 1px 0 rgba(255,255,255,.12);}
.control-room-tile.selected{transform:none;border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .54);box-shadow:0 30px 70px rgba(0,0,0,.38),0 0 0 1px rgba(var(--dynamic-accent-rgb,245 166 35) / .18),0 16px 34px rgba(var(--dynamic-accent-rgb,245 166 35) / .12);z-index:3;filter:saturate(1.04);}
.control-room-tile.is-playing{border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .72);box-shadow:0 28px 64px rgba(0,0,0,.36),0 0 0 2px rgba(var(--dynamic-accent-rgb,245 166 35) / .28),0 0 34px rgba(var(--dynamic-accent-rgb,245 166 35) / .2),inset 0 1px 0 rgba(255,255,255,.14);}
.control-room-tile.is-playing::before{opacity:.9;background:linear-gradient(180deg, rgba(var(--dynamic-accent-rgb,245 166 35) / .18), rgba(255,255,255,0) 28%, rgba(var(--dynamic-accent-rgb,245 166 35) / .08) 100%);}
.control-room-tile.is-playing .control-room-tile-copy{box-shadow:0 0 0 1px rgba(var(--dynamic-accent-rgb,245 166 35) / .16),0 12px 28px rgba(0,0,0,.22);}
.control-room-tile.primary{outline:1px solid rgba(255,255,255,.12);}
.control-room-grid:hover .control-room-tile:not(.selected){opacity:1;}
.theme-light .control-room-tile{border-color:rgba(27,41,66,.08);background:rgba(255,255,255,.54);box-shadow:0 16px 34px rgba(28,42,68,.12);}
.control-room-tile::before{content:"";position:absolute;inset:1px;border-radius:28px;background:linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,0) 24%, rgba(255,255,255,.03) 100%);pointer-events:none;opacity:.68;z-index:0;}
.theme-light .control-room-tile::before{opacity:.5;}
.control-room-tile::after{content:"";position:absolute;inset:-24% auto auto -14%;width:44%;height:84%;border-radius:50%;background:radial-gradient(circle, rgba(var(--dynamic-accent-rgb,245 166 35) / .22), transparent 70%);pointer-events:none;opacity:.34;filter:blur(10px);z-index:0;}
.theme-light .control-room-tile::after{opacity:.18;}
.control-room-tile-bg,.control-room-tile-shade{position:absolute;inset:0;pointer-events:none;}
.control-room-tile-bg{background:
  radial-gradient(circle at 80% 18%, rgba(var(--dynamic-accent-rgb,245 166 35) / .18), transparent 26%),
  linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02));
  transform:scale(1.02);}
.control-room-tile[style*='--control-room-tile-art'] .control-room-tile-bg{background:
  var(--control-room-tile-art) center/contain no-repeat,
  var(--control-room-tile-art) center/cover no-repeat;
  filter:saturate(1.08) contrast(1.02);
  transform:scale(1.02);}
.control-room-tile-shade{background:
  linear-gradient(180deg, rgba(10,13,20,.04) 0%, rgba(10,13,20,.08) 18%, rgba(10,13,20,.54) 68%, rgba(10,13,20,.92) 100%),
  linear-gradient(90deg, rgba(10,13,20,.18) 0%, rgba(10,13,20,0) 38%, rgba(10,13,20,.08) 100%);}
.theme-light .control-room-tile-shade{background:
  linear-gradient(180deg, rgba(255,255,255,.04) 0%, rgba(255,255,255,.02) 20%, rgba(245,248,252,.54) 66%, rgba(245,248,252,.9) 100%),
  linear-gradient(90deg, rgba(255,255,255,.08) 0%, rgba(255,255,255,0) 42%, rgba(255,255,255,.04) 100%);}
.control-room-tile-main,.control-room-volume-row,.control-room-select-fab{position:relative;z-index:1;}
.control-room-tile-main{display:flex;align-items:flex-end;justify-content:flex-start;min-height:100%;width:100%;background:none;border:none;color:inherit;text-align:inherit;padding:0;cursor:pointer;touch-action:manipulation;}
.control-room-select-fab{position:absolute;inset-block-start:calc(14px * var(--control-room-tile-scale, 1));inset-inline-end:calc(14px * var(--control-room-tile-scale, 1));width:clamp(34px, calc(48px * var(--control-room-tile-scale, 1)), 48px);height:clamp(34px, calc(48px * var(--control-room-tile-scale, 1)), 48px);padding:0;border-radius:clamp(12px, calc(17px * var(--control-room-tile-scale, 1)), 17px);border:1px solid rgba(255,255,255,.14);background:rgba(9,12,18,.28);color:#fff;display:grid;place-items:center;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 10px 22px rgba(0,0,0,.18);cursor:pointer;touch-action:manipulation;}
.control-room-select-fab.active{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .24);border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .3);}
.theme-light .control-room-select-fab{background:rgba(255,255,255,.58);border-color:rgba(27,40,62,.08);color:#1f2a42;}
.control-room-select-fab .ui-ic{width:16px;height:16px;}
.control-room-tile-copy{display:grid;gap:calc(8px * var(--control-room-tile-scale, 1));min-width:0;padding:calc(10px * var(--control-room-tile-scale, 1)) calc(12px * var(--control-room-tile-scale, 1)) calc(8px * var(--control-room-tile-scale, 1));border-radius:clamp(16px, calc(22px * var(--control-room-tile-scale, 1)), 22px);background:linear-gradient(180deg, rgba(8,11,18,.1), rgba(8,11,18,.26));backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);}
.theme-light .control-room-tile-copy{background:linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,.28));}
.control-room-tile-pills{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.control-room-float-pill,.control-room-primary-pill{display:inline-flex;align-items:center;min-height:clamp(20px, calc(26px * var(--control-room-tile-scale, 1)), 26px);padding:0 clamp(7px, calc(10px * var(--control-room-tile-scale, 1)), 10px);border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(9,12,18,.3);font-size:calc(clamp(8px, calc(10px * var(--control-room-tile-scale, 1)), 10px) * var(--v2-font-scale));font-weight:800;color:#fff;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);}
.theme-light .control-room-float-pill,.theme-light .control-room-primary-pill{background:rgba(255,255,255,.56);border-color:rgba(27,40,62,.08);color:#223049;}
.control-room-primary-pill{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .22);border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .24);}
.control-room-float-pill.live{background:rgba(38,183,108,.2);border-color:rgba(116,227,166,.22);}
.control-room-tile-track{font-size:calc(clamp(9px, calc(12px * var(--control-room-tile-scale, 1)), 12px) * var(--v2-font-scale));font-weight:700;color:rgba(255,255,255,.86);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 8px 18px rgba(0,0,0,.34);}
.control-room-tile-name{font-size:calc(clamp(13px, calc(18px * var(--control-room-tile-scale, 1)), 18px) * var(--v2-font-scale));font-weight:850;line-height:1.02;letter-spacing:0;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 12px 28px rgba(0,0,0,.4);}
.control-room-tile-state{font-size:calc(clamp(9px, calc(11px * var(--control-room-tile-scale, 1)), 11px) * var(--v2-font-scale));font-weight:700;color:rgba(255,255,255,.7);}
.theme-light .control-room-tile-track{color:#33445c;}
.theme-light .control-room-tile-name{color:#162238;}
.theme-light .control-room-tile-state{color:#72829a;}
.control-room-volume-row{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:calc(10px * var(--control-room-tile-scale, 1));padding:calc(8px * var(--control-room-tile-scale, 1)) calc(10px * var(--control-room-tile-scale, 1)) calc(2px * var(--control-room-tile-scale, 1));border-radius:clamp(14px, calc(18px * var(--control-room-tile-scale, 1)), 18px);background:rgba(9,12,18,.22);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);}
.theme-light .control-room-volume-row{background:rgba(255,255,255,.46);}
.control-room-volume{width:100%;}
.control-room-volume-value{min-width:34px;font-size:calc(11px * var(--v2-font-scale));font-weight:800;color:rgba(255,255,255,.78);text-align:end;}
.theme-light .control-room-volume-value{color:#4f6077;}
.control-room-tray{position:absolute;inset-inline-start:50%;inset-block-end:112px;display:grid;grid-template-rows:auto minmax(0,1fr);gap:12px;align-self:end;width:min(1180px, calc(100% - 44px));max-height:min(68vh, 620px);overflow:hidden;padding:14px 16px;border-radius:30px;border:1px solid rgba(255,255,255,.12);background:rgba(9,12,18,.4);backdrop-filter:blur(26px);-webkit-backdrop-filter:blur(26px);box-shadow:0 24px 60px rgba(0,0,0,.28);z-index:32;transform:translateX(-50%);pointer-events:auto;touch-action:auto;contain:layout paint;}
.control-room-tray.compact{width:min(760px, calc(100% - 44px));}
.control-room-tray.wide{width:min(1100px, 100%);}
.theme-light .control-room-tray{background:rgba(255,255,255,.62);border-color:rgba(27,41,66,.08);box-shadow:0 14px 30px rgba(28,42,68,.12);}
.control-room-tray-head{display:grid;gap:4px;padding:2px 2px 0;}
.control-room-tray-title{font-size:calc(15px * var(--v2-font-scale));font-weight:900;color:#fff;}
.control-room-tray-sub{font-size:calc(12px * var(--v2-font-scale));color:rgba(255,255,255,.62);}
.theme-light .control-room-tray-title{color:#18253a;}
.theme-light .control-room-tray-sub{color:#71829a;}
.control-room-transfer-bar{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr) auto;align-items:center;gap:12px;min-height:0;}
.control-room-transfer-bar select,.control-room-search{min-height:52px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.08);color:#fff;font:inherit;}
.theme-light .control-room-transfer-bar select,.theme-light .control-room-search{background:rgba(245,248,252,.94);border-color:rgba(27,40,62,.08);color:#18253a;}
.control-room-transfer-bar select{padding:0 14px;outline:none;min-width:0;pointer-events:auto;}
.control-room-transfer-board{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr) auto;align-items:stretch;gap:12px;min-height:0;}
.control-room-transfer-column{display:grid;grid-template-rows:auto minmax(0,1fr);gap:8px;min-width:0;min-height:0;}
.control-room-transfer-label{font-size:calc(11px * var(--v2-font-scale));font-weight:900;color:rgba(255,255,255,.6);padding-inline:4px;}
.theme-light .control-room-transfer-label{color:#6f8097;}
.control-room-transfer-list{display:grid;align-content:start;gap:8px;min-height:0;max-height:min(48vh, 430px);overflow:auto;overflow-y:auto;padding-inline-end:4px;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;scrollbar-gutter:stable;}
.control-room-transfer-choice{display:grid;grid-template-columns:44px minmax(0,1fr) 24px;align-items:center;gap:10px;min-height:58px;padding:8px 10px;border-radius:18px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:inherit;text-align:inherit;}
.control-room-transfer-choice.active{border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .32);background:rgba(var(--dynamic-accent-rgb,245 166 35) / .16);}
.theme-light .control-room-transfer-choice{background:rgba(255,255,255,.82);border-color:rgba(28,42,68,.08);}
.control-room-transfer-art{width:44px;height:44px;border-radius:14px;overflow:hidden;background:rgba(255,255,255,.08);display:grid;place-items:center;color:#fff;}
.theme-light .control-room-transfer-art{background:rgba(234,240,247,.96);color:#30415a;}
.control-room-transfer-art img{width:100%;height:100%;object-fit:cover;display:block;}
.control-room-transfer-copy{display:grid;gap:2px;min-width:0;}
.control-room-transfer-title,.control-room-transfer-sub{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.control-room-transfer-title{font-size:calc(13px * var(--v2-font-scale));font-weight:850;color:#fff;}
.control-room-transfer-sub{font-size:calc(11px * var(--v2-font-scale));color:rgba(255,255,255,.58);}
.theme-light .control-room-transfer-title{color:#18253a;}
.theme-light .control-room-transfer-sub{color:#73849a;}
.control-room-transfer-check{width:24px;height:24px;display:grid;place-items:center;color:rgba(var(--dynamic-accent-rgb,245 166 35) / .98);}
.control-room-transfer-check .ui-ic{width:14px;height:14px;}
.control-room-transfer-action{align-self:end;}
.control-room-transfer-action:disabled{opacity:.42;cursor:not-allowed;}
.control-room-transfer-arrow{width:44px;height:44px;border-radius:16px;display:grid;place-items:center;color:rgba(255,255,255,.8);background:rgba(255,255,255,.06);}
.theme-light .control-room-transfer-arrow{color:#3d4f69;background:rgba(236,241,247,.94);}
.control-room-tray-btn{width:52px;height:52px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.08);color:#fff;display:grid;place-items:center;}
.control-room-tray-btn.primary{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .22);border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .28);}
.control-room-search{display:grid;grid-template-columns:20px minmax(0,1fr) 40px;align-items:center;gap:10px;padding:0 12px 0 16px;}
.control-room-search input{width:100%;background:none;border:none;outline:none;color:inherit;font:inherit;}
.control-room-search .ui-ic{width:18px;height:18px;opacity:.72;}
.control-room-search-mic{width:36px;height:36px;padding:0;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.08);color:inherit;display:grid;place-items:center;}
.theme-light .control-room-search-mic{background:rgba(234,240,247,.9);border-color:rgba(27,40,62,.08);}
.control-room-search-mic .ui-ic{opacity:.9;}
.control-room-library-results{min-height:0;max-height:min(58vh, 540px);overflow:auto;overflow-y:auto;padding-inline-end:4px;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;scrollbar-gutter:stable;}
.control-room-picker-list{display:grid;gap:10px;min-height:0;max-height:min(58vh, 540px);overflow:auto;overflow-y:auto;padding-inline-end:4px;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;scrollbar-gutter:stable;}
.control-room-picker-row{display:grid;grid-template-columns:52px minmax(0,1fr) 28px;align-items:center;gap:12px;padding:10px 12px;border-radius:20px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:inherit;text-align:inherit;}
.control-room-picker-row.active{border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .28);background:rgba(var(--dynamic-accent-rgb,245 166 35) / .14);}
.theme-light .control-room-picker-row{background:rgba(255,255,255,.82);border-color:rgba(28,42,68,.08);}
.control-room-picker-art{width:52px;height:52px;border-radius:16px;overflow:hidden;background:rgba(255,255,255,.08);display:grid;place-items:center;color:#fff;}
.theme-light .control-room-picker-art{background:rgba(234,240,247,.96);color:#30415a;}
.control-room-picker-art img{width:100%;height:100%;object-fit:cover;display:block;}
.control-room-picker-art .ui-ic{width:18px;height:18px;}
.control-room-picker-copy{display:grid;gap:2px;min-width:0;}
.control-room-picker-title,.control-room-picker-sub{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.control-room-picker-title{font-size:calc(14px * var(--v2-font-scale));font-weight:800;color:#fff;}
.control-room-picker-sub{font-size:calc(12px * var(--v2-font-scale));color:rgba(255,255,255,.58);}
.theme-light .control-room-picker-title{color:#18253a;}
.theme-light .control-room-picker-sub{color:#73849a;}
.control-room-picker-check{width:28px;height:28px;border-radius:999px;background:rgba(255,255,255,.08);display:grid;place-items:center;color:#fff;}
.theme-light .control-room-picker-check{background:rgba(234,240,247,.96);color:#2e3f58;}
.control-room-picker-check .ui-ic{width:14px;height:14px;}
.control-room-picker-row,.control-room-media-card,.control-room-transfer-choice{pointer-events:auto;touch-action:pan-y;}
.control-room-transfer-bar select,.control-room-tray-btn,.control-room-search input,.control-room-search-mic{pointer-events:auto;touch-action:manipulation;}
.control-room-picker-list,.control-room-library-results{scrollbar-width:thin;}
.control-room-transfer-list,
.control-room-picker-list,
.control-room-library-results,
.control-room-saved-scenes,
.control-room-queue-preview,
.control-room-tray.transfer-panel .control-room-transfer-list,
.control-room-tray.transfer-panel .control-room-queue-preview{
  scrollbar-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .58) rgba(255,255,255,.08);
}
.control-room-transfer-list::-webkit-scrollbar,
.control-room-picker-list::-webkit-scrollbar,
.control-room-library-results::-webkit-scrollbar,
.control-room-saved-scenes::-webkit-scrollbar,
.control-room-queue-preview::-webkit-scrollbar,
.control-room-tray.transfer-panel .control-room-transfer-list::-webkit-scrollbar,
.control-room-tray.transfer-panel .control-room-queue-preview::-webkit-scrollbar{
  width:12px;
  height:12px;
}
.control-room-transfer-list::-webkit-scrollbar-track,
.control-room-picker-list::-webkit-scrollbar-track,
.control-room-library-results::-webkit-scrollbar-track,
.control-room-saved-scenes::-webkit-scrollbar-track,
.control-room-queue-preview::-webkit-scrollbar-track,
.control-room-tray.transfer-panel .control-room-transfer-list::-webkit-scrollbar-track,
.control-room-tray.transfer-panel .control-room-queue-preview::-webkit-scrollbar-track{
  border-radius:999px;
  background:rgba(255,255,255,.07);
}
.control-room-transfer-list::-webkit-scrollbar-thumb,
.control-room-picker-list::-webkit-scrollbar-thumb,
.control-room-library-results::-webkit-scrollbar-thumb,
.control-room-saved-scenes::-webkit-scrollbar-thumb,
.control-room-queue-preview::-webkit-scrollbar-thumb,
.control-room-tray.transfer-panel .control-room-transfer-list::-webkit-scrollbar-thumb,
.control-room-tray.transfer-panel .control-room-queue-preview::-webkit-scrollbar-thumb{
  min-height:54px;
  border:3px solid transparent;
  border-radius:999px;
  background-clip:content-box;
  background-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .58);
}
.card.layout-tablet .control-room-transfer-list,
.card.layout-tablet .control-room-picker-list,
.card.layout-tablet .control-room-library-results,
.card.layout-tablet .control-room-saved-scenes,
.card.layout-tablet .control-room-queue-preview{
  padding-inline-end:12px;
  scrollbar-width:auto;
  scrollbar-gutter:stable both-edges;
}
.card.layout-tablet .control-room-transfer-list::-webkit-scrollbar,
.card.layout-tablet .control-room-picker-list::-webkit-scrollbar,
.card.layout-tablet .control-room-library-results::-webkit-scrollbar,
.card.layout-tablet .control-room-saved-scenes::-webkit-scrollbar,
.card.layout-tablet .control-room-queue-preview::-webkit-scrollbar{
  width:16px;
  height:16px;
}
.card.layout-tablet .control-room-group-summary,
.card.layout-tablet .control-room-library-shortcuts{
  scrollbar-width:auto;
  scrollbar-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .58) rgba(255,255,255,.08);
  padding-bottom:10px;
}
.card.layout-tablet .control-room-group-summary::-webkit-scrollbar,
.card.layout-tablet .control-room-library-shortcuts::-webkit-scrollbar{
  display:block;
  height:14px;
}
.card.layout-tablet .control-room-group-summary::-webkit-scrollbar-track,
.card.layout-tablet .control-room-library-shortcuts::-webkit-scrollbar-track{
  border-radius:999px;
  background:rgba(255,255,255,.07);
}
.card.layout-tablet .control-room-group-summary::-webkit-scrollbar-thumb,
.card.layout-tablet .control-room-library-shortcuts::-webkit-scrollbar-thumb{
  border:3px solid transparent;
  border-radius:999px;
  background-clip:content-box;
  background-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .58);
}
.theme-light .control-room-transfer-list,
.theme-light .control-room-picker-list,
.theme-light .control-room-library-results,
.theme-light .control-room-saved-scenes,
.theme-light .control-room-queue-preview,
.theme-light .control-room-group-summary,
.theme-light .control-room-library-shortcuts{
  scrollbar-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .62) rgba(27,41,66,.08);
}
.theme-light .control-room-transfer-list::-webkit-scrollbar-track,
.theme-light .control-room-picker-list::-webkit-scrollbar-track,
.theme-light .control-room-library-results::-webkit-scrollbar-track,
.theme-light .control-room-saved-scenes::-webkit-scrollbar-track,
.theme-light .control-room-queue-preview::-webkit-scrollbar-track,
.theme-light .control-room-group-summary::-webkit-scrollbar-track,
.theme-light .control-room-library-shortcuts::-webkit-scrollbar-track{
  background:rgba(27,41,66,.08);
}
@media (max-width:760px){
  .control-room-tray{inset-block-end:86px;width:calc(100% - 16px);max-height:calc(100dvh - 146px);padding:12px;border-radius:24px;}
  .control-room-transfer-bar,.control-room-transfer-board{grid-template-columns:minmax(0,1fr);}
  .control-room-transfer-arrow{display:none;}
  .control-room-transfer-action{width:100%;}
  .control-room-transfer-list{max-height:min(30dvh, 220px);}
  .control-room-picker-list,.control-room-library-results{max-height:calc(100dvh - 260px);}
}
.control-room-media-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(138px,1fr));gap:12px;}
.control-room-media-card{display:grid;gap:10px;padding:10px;border-radius:20px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:inherit;text-align:inherit;}
.theme-light .control-room-media-card{background:rgba(255,255,255,.78);border-color:rgba(28,42,68,.08);}
.control-room-media-art{aspect-ratio:1/1;border-radius:16px;overflow:hidden;background:rgba(255,255,255,.08);display:grid;place-items:center;color:rgba(255,255,255,.78);}
.theme-light .control-room-media-art{background:rgba(235,240,246,.96);color:#506178;}
.control-room-media-art img{width:100%;height:100%;object-fit:cover;display:block;}
.control-room-media-copy{display:grid;gap:4px;min-width:0;}
.control-room-media-title,.control-room-media-sub{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.control-room-media-title{font-size:calc(13px * var(--v2-font-scale));font-weight:800;color:#fff;}
.control-room-media-sub{font-size:calc(11px * var(--v2-font-scale));color:rgba(255,255,255,.6);}
.theme-light .control-room-media-title{color:#17253a;}
.theme-light .control-room-media-sub{color:#74839a;}
.control-room-empty{min-height:72px;display:grid;place-items:center;padding:16px;text-align:center;font-size:calc(13px * var(--v2-font-scale));color:rgba(255,255,255,.62);}
.control-room-empty.subtle{min-height:92px;border-radius:18px;border:1px dashed rgba(255,255,255,.12);}
.theme-light .control-room-empty{color:#6f8097;}
.theme-light .control-room-empty.subtle{border-color:rgba(27,41,66,.1);}
.control-room-dock{position:relative;left:auto;bottom:auto;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;max-width:calc(100% - 8px);max-height:var(--control-room-dock-reserve, 116px);width:auto;margin:0 auto;padding:10px 14px calc(12px + env(safe-area-inset-bottom, 0px));border-radius:26px 26px 0 0;border:1px solid rgba(255,255,255,.14);border-bottom:none;background:linear-gradient(180deg, rgba(17,22,31,.72), rgba(9,12,18,.56));backdrop-filter:blur(26px);-webkit-backdrop-filter:blur(26px);box-shadow:0 18px 48px rgba(0,0,0,.28);transform:none;align-self:end;z-index:2;overflow:visible;box-sizing:border-box;}
.theme-light .control-room-dock{background:rgba(255,255,255,.68);border-color:rgba(28,42,68,.08);box-shadow:0 14px 30px rgba(28,42,68,.12);}
.control-room-now-pill{display:flex;align-items:center;gap:12px;min-width:300px;max-width:390px;padding:10px 14px 10px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);box-shadow:0 10px 24px rgba(0,0,0,.16);}
.theme-light .control-room-now-pill{background:rgba(245,248,252,.94);border-color:rgba(28,42,68,.08);}
.control-room-now-art{width:54px;height:54px;border-radius:18px;overflow:hidden;display:grid;place-items:center;flex:none;background:rgba(255,255,255,.08);color:#fff;}
.theme-light .control-room-now-art{background:rgba(229,236,244,.96);color:#2a3a52;}
.control-room-now-art img{width:100%;height:100%;object-fit:cover;display:block;}
.control-room-now-art .ui-ic{width:22px;height:22px;}
.control-room-now-copy{display:grid;gap:2px;min-width:0;}
.control-room-now-kicker{font-size:calc(11px * var(--v2-font-scale));font-weight:800;color:rgba(255,255,255,.56);}
.control-room-now-name{font-size:calc(15px * var(--v2-font-scale));font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.control-room-now-track{font-size:calc(12px * var(--v2-font-scale));color:rgba(255,255,255,.72);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.theme-light .control-room-now-kicker{color:#6e7f96;}
.theme-light .control-room-now-name{color:#18253a;}
.theme-light .control-room-now-track{color:#61738b;}
.control-room-dock-section{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:999px;background:rgba(255,255,255,.04);}
.theme-light .control-room-dock-section{background:rgba(255,255,255,.48);}
.control-room-dock-divider{width:1px;height:42px;background:rgba(255,255,255,.12);display:block;}
.theme-light .control-room-dock-divider{background:rgba(28,42,68,.08);}
.control-room-selection-pill{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-width:76px;height:58px;padding:6px 14px;border-radius:18px;background:rgba(var(--dynamic-accent-rgb,245 166 35) / .28);border:1px solid rgba(var(--dynamic-accent-rgb,245 166 35) / .32);font-size:calc(13px * var(--v2-font-scale));font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px;box-shadow:0 12px 28px rgba(0,0,0,.22);}
.control-room-selection-count{font-size:calc(15px * var(--v2-font-scale));line-height:1;}
.control-room-selection-pill.active{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .38);}
.theme-light .control-room-selection-pill{color:#433006;}
.control-room-dock-btn{min-width:70px;width:auto;height:58px;padding:6px 10px;border-radius:18px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.08);color:#fff;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;box-shadow:0 10px 24px rgba(0,0,0,.12);cursor:pointer;touch-action:manipulation;}
.control-room-dock-btn.active{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .26);border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .32);}
.theme-light .control-room-dock-btn{background:rgba(245,248,252,.94);border-color:rgba(28,42,68,.08);color:#1b2740;}
.control-room-dock-btn .ui-ic,.control-room-tray-btn .ui-ic{width:20px;height:20px;}
.control-room-dock-btn.library-pill{width:auto;min-width:70px;padding:6px 10px;}
.control-room-dock-label{font-size:calc(10px * var(--v2-font-scale));font-weight:850;line-height:1;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis;}
.control-room-dock-btn{position:relative;}
.control-room-badge-count{position:absolute;inset-block-start:4px;inset-inline-end:4px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:rgba(var(--dynamic-accent-rgb,245 166 35) / .96);color:#fff;font-size:calc(10px * var(--v2-font-scale));font-weight:900;display:grid;place-items:center;line-height:1;}
.control-room-dock-section.player .control-room-dock-btn:first-child{min-width:78px;}
.control-room-dock-section.player .control-room-dock-btn:first-child .ui-ic{width:22px;height:22px;}
.card.layout-tablet .control-room-scene{padding:var(--control-room-head-reserve, 68px) 12px 0!important;}
.card.layout-tablet .control-room-layout{gap:6px!important;overflow:hidden!important;}
.card.layout-tablet .control-room-grid-wrap{padding:2px 8px 0!important;place-items:start center!important;align-content:start!important;}
.card.layout-tablet .control-room-grid{max-width:min(var(--control-room-grid-max-width, 100%), 100%)!important;max-height:min(var(--control-room-grid-max-height, 100%), 100%)!important;}
.card.layout-tablet .control-room-tile{border-radius:24px;padding:12px 12px 10px;gap:7px;}
.card.layout-tablet .control-room-tile::before{border-radius:22px;}
.card.layout-tablet .control-room-tile-copy{gap:5px;padding:8px 10px 7px;border-radius:18px;}
.card.layout-tablet .control-room-tile-name{font-size:calc(15px * var(--v2-font-scale));}
.card.layout-tablet .control-room-tile-track{font-size:calc(11px * var(--v2-font-scale));}
.card.layout-tablet .control-room-volume-row{gap:8px;padding:6px 8px 0;border-radius:15px;}
.card.layout-tablet .control-room-select-fab{inset-block-start:10px;inset-inline-end:10px;width:42px;height:42px;border-radius:14px;}
.card.layout-tablet .control-room-dock{max-width:calc(100% - 12px)!important;gap:8px!important;flex-wrap:nowrap!important;padding:8px 10px calc(10px + env(safe-area-inset-bottom, 0px))!important;border-radius:24px 24px 0 0!important;overflow:visible!important;}
.card.layout-tablet .control-room-now-pill{min-width:180px;max-width:230px;padding:7px 10px 7px 7px;gap:9px;}
.card.layout-tablet .control-room-now-art{width:42px;height:42px;border-radius:14px;}
.card.layout-tablet .control-room-now-name{font-size:calc(13px * var(--v2-font-scale));}
.card.layout-tablet .control-room-now-track{font-size:calc(11px * var(--v2-font-scale));}
.card.layout-tablet .control-room-dock-section{gap:7px;padding:5px 7px;}
.card.layout-tablet .control-room-dock-btn,.card.layout-tablet .control-room-selection-pill{width:auto!important;height:50px!important;min-width:58px!important;border-radius:15px;padding:5px 8px!important;}
.card.layout-tablet .control-room-selection-pill{max-width:86px;}
.card.layout-tablet .control-room-dock-btn.library-pill{width:auto!important;min-width:58px!important;}
.card.layout-tablet .control-room-dock-section.player .control-room-dock-btn:first-child{min-width:64px!important;}
.card.layout-tablet .control-room-dock-label{font-size:calc(9px * var(--v2-font-scale));}
.card.layout-tablet .control-room-dock-btn .ui-ic,.card.layout-tablet .control-room-tray-btn .ui-ic{width:17px;height:17px;}
@media (max-width: 980px){
  .card.layout-tablet .control-room-now-pill{display:none!important;}
  .card.layout-tablet .control-room-dock{gap:6px!important;padding-inline:8px!important;}
  .card.layout-tablet .control-room-dock-section{gap:6px;padding:5px 6px;}
  .card.layout-tablet .control-room-dock-btn,.card.layout-tablet .control-room-selection-pill{width:auto!important;height:46px!important;min-width:50px!important;border-radius:14px;}
}
@media (max-height: 620px){
  .control-room-scene{padding:var(--control-room-head-reserve, 54px) 10px 0!important;}
  .control-room-layout{gap:4px!important;}
  .control-room-grid-wrap{padding:0 6px!important;}
  .control-room-now-pill{display:none!important;}
  .control-room-dock{gap:6px!important;padding:6px 8px calc(8px + env(safe-area-inset-bottom, 0px))!important;border-radius:20px 20px 0 0!important;}
  .control-room-dock-section{gap:5px!important;padding:4px 5px!important;}
  .control-room-dock-btn,.control-room-selection-pill{width:auto!important;height:42px!important;min-width:48px!important;border-radius:13px!important;}
  .control-room-dock-label{font-size:9px!important;}
  .control-room-dock-section.player .control-room-dock-btn:first-child{min-width:52px!important;}
  .control-room-dock-btn .ui-ic,.control-room-tray-btn .ui-ic{width:16px!important;height:16px!important;}
}
.control-room-scene::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg, rgba(6,9,16,.12), rgba(6,9,16,.16) 44%, rgba(6,9,16,.28) 100%);pointer-events:none;}
@keyframes control-room-scene-drift{
  from{transform:scale(1.14) translate3d(-1.2%, -1.1%, 0);}
  to{transform:scale(1.18) translate3d(1.4%, 1%, 0);}
}
@keyframes control-room-glow-breathe{
  0%,100%{opacity:.8;transform:scale(1);}
  50%{opacity:.94;transform:scale(1.04);}
}
.card.layout-tablet.tablet-stable .control-room-scene-bg,
.card.layout-tablet.tablet-stable .control-room-scene-glow{animation:none!important;filter:blur(10px)!important;transform:none!important;}
.card.layout-tablet.tablet-stable .control-room-tile,
.card.layout-tablet.tablet-stable .control-room-dock,
.card.layout-tablet.tablet-stable .control-room-tray,
.card.layout-tablet.tablet-stable .history-drawer,
.card.layout-tablet.tablet-stable .history-chip,
.card.layout-tablet.tablet-stable .source-badge,
.card.layout-tablet.tablet-stable .menu-sheet,
.card.layout-tablet.tablet-stable .menu-backdrop,
.card.layout-tablet.tablet-stable .control-room-close,
.card.layout-tablet.tablet-stable .control-room-head{transition:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;}
.card.layout-tablet.tablet-stable .control-room-dock,
.card.layout-tablet.tablet-stable .control-room-tray,
.card.layout-tablet.tablet-stable .history-drawer,
.card.layout-tablet.tablet-stable .menu-sheet{background:rgba(15,20,29,.88)!important;}
.theme-light .card.layout-tablet.tablet-stable .control-room-dock,
.theme-light .card.layout-tablet.tablet-stable .control-room-tray,
.theme-light .card.layout-tablet.tablet-stable .history-drawer,
.theme-light .card.layout-tablet.tablet-stable .menu-sheet{background:rgba(250,252,255,.96)!important;}
.card.layout-tablet.tablet-stable .sidebar,
.card.layout-tablet.tablet-stable .topbar,
.card.layout-tablet.tablet-stable .tablet-rail-card,
.card.layout-tablet.tablet-stable .queue-panel,
.card.layout-tablet.tablet-stable .modal,
.card.layout-tablet.tablet-stable .ctx-menu,
.card.layout-tablet.tablet-stable .lyrics-sheet,
.card.layout-tablet.tablet-stable .active-player-card,
.card.layout-tablet.tablet-stable .player-menu-card,
.card.layout-tablet.tablet-stable .footer-btn,
.card.layout-tablet.tablet-stable .action-btn,
.card.layout-tablet.tablet-stable .queue-row,
.card.layout-tablet.tablet-stable .active-player-chip,
.card.layout-tablet.tablet-stable .player-picker-chip,
.card.layout-tablet.tablet-stable .settings-check-pill,
.card.layout-tablet.tablet-stable .chip-btn,
.card.layout-tablet.tablet-stable .night-quick-btn,
.card.layout-tablet.tablet-stable .up-next-inline,
.card.layout-tablet.tablet-stable .history-toggle-fab,
.card.layout-tablet.tablet-stable .source-badge{
  transition:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
  transform:translateZ(0);
  will-change:auto!important;
}
.card.layout-tablet.tablet-stable > .history-toggle-fab{
  transform:translateY(-50%) translateZ(0)!important;
}
.card.layout-tablet.tablet-stable > .history-toggle-fab:active{
  transform:translateY(-50%) scale(.97) translateZ(0)!important;
}
.card.layout-tablet.tablet-stable .bg,
.card.layout-tablet.tablet-stable .shade,
.card.layout-tablet.tablet-stable .glow,
.card.layout-tablet.tablet-stable .art-aura,
.card.layout-tablet.tablet-stable .hero-aura,
.card.layout-tablet.tablet-stable .compact-cover-echo{
  transition:none!important;
}
.card.layout-tablet.tablet-stable .control-room-grid-wrap,
.card.layout-tablet.tablet-stable .control-room-grid{
  contain:layout paint!important;
  transform:none!important;
  will-change:auto!important;
}
.card.layout-tablet.tablet-stable .control-room-tile:hover,
.card.layout-tablet.tablet-stable .control-room-tile:active,
.card.layout-tablet.tablet-stable .control-room-tile.tap-feedback,
.card.layout-tablet.tablet-stable .queue-row:hover,
.card.layout-tablet.tablet-stable .queue-row:active,
.card.layout-tablet.tablet-stable .queue-row.tap-feedback{
  transform:none!important;
  filter:none!important;
}
.card.layout-tablet.tablet-stable .control-room-tile::before,
.card.layout-tablet.tablet-stable .control-room-tile::after,
.card.layout-tablet.tablet-stable .control-room-tile-bg,
.card.layout-tablet.tablet-stable .control-room-tile-shade,
.card.layout-tablet.tablet-stable .queue-row::before,
.card.layout-tablet.tablet-stable .queue-row::after{
  animation:none!important;
  transition:none!important;
  transform:none!important;
  will-change:auto!important;
}
.card.layout-tablet.tablet-stable .control-room-tile-bg{
  filter:none!important;
}
.card.layout-tablet.tablet-stable .control-room-tile.is-playing{
  border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .78)!important;
  box-shadow:0 0 0 2px rgba(var(--dynamic-accent-rgb,245 166 35) / .32),0 16px 30px rgba(0,0,0,.24)!important;
}
.card.layout-tablet .control-room-head{
  padding:12px 16px!important;
  z-index:58!important;
}
.card.layout-tablet .control-room-close{
  z-index:59!important;
  pointer-events:auto!important;
}
.card.layout-tablet .control-room-scene{
  padding:calc(var(--control-room-head-reserve, 64px) + 2px) 12px 0!important;
  height:100%!important;
  max-height:100%!important;
}
.card.layout-tablet .control-room-grid-wrap{
  padding:0 10px 0!important;
  min-height:0!important;
  height:100%!important;
  max-height:var(--control-room-grid-available-height, 100%)!important;
}
.card.layout-tablet .control-room-grid{
  max-height:var(--control-room-grid-available-height, 100%)!important;
  overflow:hidden!important;
  align-content:start!important;
}
.card.layout-tablet .control-room-tray{
  inset-block-end:92px!important;
  max-height:min(calc(100% - var(--control-room-head-reserve, 64px) - 108px), 560px)!important;
}
@media (prefers-reduced-motion: reduce){
  .control-room-scene-bg,.control-room-scene-glow{animation:none!important;}
}
.footer-btn.control-room-entry{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .18);border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .22);}
.theme-light .footer-btn.control-room-entry{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .12);}
.history-drawer-title-row{display:flex;align-items:center;justify-content:space-between;gap:10px;min-width:0;}
.history-drawer-title-main{display:grid;gap:4px;min-width:0;}
.history-drawer-brand{width:104px;max-width:52%;color:rgba(255,255,255,.62);opacity:.94;display:grid;place-items:start;}
.theme-light .history-drawer-brand{color:rgba(31,38,51,.42);}
.history-drawer-close{width:34px;height:34px;min-width:34px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.08);color:inherit;display:grid;place-items:center;padding:0;cursor:pointer;}
.history-drawer-close .ui-ic{width:16px;height:16px;}
.theme-light .history-drawer-close{background:rgba(238,243,248,.86);border-color:rgba(143,159,181,.18);color:#1f2633;}
.mobile-timer-fab,
.mobile-timer-fab.active{display:inline-flex!important;align-items:center!important;justify-content:center!important;flex-direction:row!important;width:auto!important;min-width:42px!important;height:42px!important;gap:6px!important;padding:0 11px!important;color:#fff!important;background:rgba(14,18,28,.34)!important;border-color:rgba(255,255,255,.16)!important;box-shadow:0 12px 24px rgba(0,0,0,.14), inset 0 1px 0 rgba(255,255,255,.08)!important;}
.mobile-timer-fab[hidden],
.mobile-timer-fab.hidden{display:none!important;}
.theme-light .mobile-timer-fab,
.theme-light .mobile-timer-fab.active{color:#1f2633!important;background:rgba(255,255,255,.76)!important;border-color:rgba(141,155,177,.22)!important;box-shadow:0 12px 26px rgba(111,126,150,.16)!important;}
.mobile-timer-fab.active{min-width:78px!important;}
.mobile-timer-fab .ui-ic{flex:0 0 auto!important;}
.mobile-timer-fab .mobile-timer-label{display:inline-block!important;color:inherit!important;font-weight:950!important;direction:ltr!important;line-height:1!important;white-space:nowrap!important;}
.mobile-timer-fab .mobile-timer-label[hidden]{display:none!important;}
.card.layout-tablet .sleep-timer-corner,
.card.layout-tablet .sleep-timer-corner.left,
.card.layout-tablet .sleep-timer-corner.right{
  top:auto!important;
  bottom:22px!important;
  left:auto!important;
  right:76px!important;
  transform:none!important;
  justify-items:end!important;
  align-items:center!important;
  z-index:8!important;
}
.card.layout-tablet .sleep-timer-chip{
  min-height:34px!important;
  padding:0 12px!important;
  gap:7px!important;
}
.card.layout-tablet > .home-shortcut-fab.tablet{
  position:absolute!important;
  top:18px!important;
  bottom:auto!important;
  transform:none!important;
  z-index:72!important;
  pointer-events:auto!important;
}
.card.layout-tablet.rtl > .home-shortcut-fab.tablet{
  inset:18px auto auto 18px!important;
  right:auto!important;
  left:18px!important;
}
.card.layout-tablet:not(.rtl) > .home-shortcut-fab.tablet{
  inset:18px 18px auto auto!important;
  right:18px!important;
  left:auto!important;
}
.top-settings-fab{
  display:none!important;
  pointer-events:none!important;
}
.card.layout-tablet.rtl > .sleep-timer-corner,
.card.layout-tablet.rtl > .sleep-timer-corner.left,
.card.layout-tablet.rtl > .sleep-timer-corner.right{
  position:absolute!important;
  inset:auto 76px 22px auto!important;
  top:auto!important;
  right:76px!important;
  bottom:22px!important;
  left:auto!important;
  transform:none!important;
  justify-items:end!important;
  z-index:9!important;
}
.card.layout-tablet:not(.rtl) > .sleep-timer-corner,
.card.layout-tablet:not(.rtl) > .sleep-timer-corner.left,
.card.layout-tablet:not(.rtl) > .sleep-timer-corner.right{
  position:absolute!important;
  inset:auto auto 22px 76px!important;
  top:auto!important;
  right:auto!important;
  bottom:22px!important;
  left:76px!important;
  transform:none!important;
  justify-items:start!important;
  z-index:9!important;
}
.card.compact-expanded > .home-shortcut-fab.mobile,
.card.compact-mode.compact-expanded > .home-shortcut-fab.mobile{
  position:absolute!important;
  inset:18px auto auto 18px!important;
  top:18px!important;
  right:auto!important;
  bottom:auto!important;
  left:18px!important;
  transform:none!important;
  z-index:12!important;
}
.card.compact-expanded > .top-settings-fab,
.card.compact-mode.compact-expanded > .top-settings-fab{
  position:absolute!important;
  inset:18px 66px auto auto!important;
  top:18px!important;
  right:66px!important;
  bottom:auto!important;
  left:auto!important;
  transform:none!important;
  z-index:12!important;
}
.card.compact-expanded > .compact-collapse-fab,
.card.compact-mode.compact-expanded > .compact-collapse-fab{
  position:absolute!important;
  inset:18px 18px auto auto!important;
  top:18px!important;
  right:18px!important;
  bottom:auto!important;
  left:auto!important;
  transform:none!important;
  z-index:44!important;
  width:46px!important;
  height:46px!important;
  min-width:46px!important;
  min-height:46px!important;
  padding:0!important;
  display:grid!important;
  place-items:center!important;
  cursor:pointer!important;
  pointer-events:auto!important;
  touch-action:manipulation!important;
  border:1px solid rgba(255,255,255,.2)!important;
  border-radius:15px!important;
  background:linear-gradient(145deg, rgba(255,255,255,.18), rgba(255,255,255,.07)), rgba(12,16,24,.24)!important;
  box-shadow:0 14px 30px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.18)!important;
  backdrop-filter:blur(16px)!important;
  -webkit-backdrop-filter:blur(16px)!important;
}
.card.compact-expanded:not(.has-top-settings) > .compact-collapse-fab,
.card.compact-mode.compact-expanded:not(.has-top-settings) > .compact-collapse-fab{
  inset:18px 18px auto auto!important;
  right:18px!important;
}
.card.compact-expanded > .compact-collapse-fab::before,
.card.compact-mode.compact-expanded > .compact-collapse-fab::before{
  content:"";
  position:absolute;
  inset:-8px;
  border-radius:22px;
}
        .card.compact-expanded > .compact-collapse-fab .ui-ic,
        .card.compact-mode.compact-expanded > .compact-collapse-fab .ui-ic{
          width:22px!important;
          height:22px!important;
          pointer-events:none!important;
        }
        .card.compact-menu-open > .compact-collapse-fab,
        .card.compact-mode.compact-menu-open > .compact-collapse-fab,
        :host(.compact-popup-open) .card.compact-expanded:has(.menu-backdrop.open) > .compact-collapse-fab,
        :host(.compact-popup-open) .card.compact-expanded:has(.queue-action-backdrop.open) > .compact-collapse-fab,
        :host(.compact-popup-open) .card.compact-expanded:has(.control-room-backdrop.open) > .compact-collapse-fab,
        :host(.compact-popup-open) .card.compact-expanded:has(.screensaver-backdrop.open) > .compact-collapse-fab,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded:has(.menu-backdrop.open) > .compact-collapse-fab,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded:has(.queue-action-backdrop.open) > .compact-collapse-fab,
        :host(.compact-popup-open.compact-menu-open) .compact-collapse-fab,
        :host(.compact-window-popup-open.compact-menu-open) .compact-collapse-fab{
          opacity:0!important;
          visibility:hidden!important;
          pointer-events:none!important;
        }
        .card.control-room-open > .compact-collapse-fab,
        .card.control-room-open > .top-settings-fab,
        .card.control-room-open > .home-shortcut-fab{
  opacity:0!important;
  visibility:hidden!important;
  display:none!important;
  pointer-events:none!important;
}
.card.control-room-open > .home-shortcut-fab{
  opacity:0!important;
  visibility:hidden!important;
  display:none!important;
  pointer-events:none!important;
  z-index:0!important;
}
.card.layout-tablet.control-room-open > .home-shortcut-fab.tablet,
.card.compact-expanded.control-room-open > .home-shortcut-fab.mobile,
.card.compact-mode.compact-expanded.control-room-open > .home-shortcut-fab.mobile{
  opacity:0!important;
  visibility:hidden!important;
  display:none!important;
  pointer-events:none!important;
  z-index:0!important;
}
.menu-body.library-mode,
.menu-body.library-mode .library-shell,
.menu-body.library-mode .library-body,
.menu-body.library-mode .media-home-shell,
.menu-body.library-mode .media-results,
.menu-body.library-mode .media-items-list{
  width:100%!important;
  max-width:100%!important;
  min-width:0!important;
  overflow-x:hidden!important;
  transform:none!important;
  touch-action:pan-y!important;
  overscroll-behavior-x:none!important;
}
.menu-body.library-mode .library-shell{height:100%!important;contain:layout paint;}
.menu-body.library-mode .library-body,
#mobileMediaSearchResults{
  overflow-y:auto!important;
  overflow-x:hidden!important;
  -webkit-overflow-scrolling:touch;
  overscroll-behavior:contain!important;
  overflow-anchor:none!important;
  scroll-behavior:auto!important;
}
.menu-body.sheet-queue,
.menu-body.sheet-queue .queue-list{
  overflow-x:hidden!important;
  transform:none!important;
  touch-action:pan-y!important;
  overscroll-behavior-x:none!important;
}
.menu-sheet.sheet-queue,
.menu-body.sheet-queue .queue-row,
.menu-body.sheet-queue .queue-list,
.menu-body.sheet-queue .queue-page-head{
  animation:none!important;
  transition:none!important;
  transform:none!important;
  will-change:auto!important;
}
.menu-body.sheet-queue .queue-row,
.menu-body.sheet-queue .menu-thumb,
.menu-body.sheet-queue .chip-btn{
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
.menu-body.sheet-queue .queue-eq span{
  animation:none!important;
}
.menu-body.sheet-queue .queue-row.active,
.mini-queue-item.active{
  border-color:color-mix(in srgb, var(--ma-accent) 48%, rgba(255,255,255,.18))!important;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--ma-accent) 24%, transparent), transparent 72%),
    color-mix(in srgb, var(--ma-soft) 92%, transparent)!important;
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--ma-accent) 28%, transparent),
    0 12px 28px rgba(0,0,0,.18)!important;
}
.menu-body.sheet-queue .queue-row.active .queue-title,
.menu-body.sheet-queue .queue-row.active .queue-index,
.mini-queue-item.active .mini-queue-name,
.mini-queue-item.active .mini-queue-index{
  color:color-mix(in srgb, var(--ma-accent) 76%, white 24%)!important;
}
.queue-action-backdrop,
.queue-action-sheet,
.queue-action-item{
  animation:none!important;
  transition:none!important;
  will-change:auto!important;
}
.queue-action-sheet,
.queue-action-item{
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
.card.layout-tablet .menu-body.sheet-queue,
.card.layout-tablet .menu-body.sheet-queue .queue-list{
  contain:layout paint!important;
  isolation:isolate!important;
}
.card.layout-tablet .menu-body.sheet-queue .queue-row,
.card.layout-tablet .menu-body.sheet-queue .queue-row:hover,
.card.layout-tablet .menu-body.sheet-queue .queue-row:active,
.card.layout-tablet .menu-body.sheet-queue .queue-row.tap-feedback{
  transform:none!important;
  filter:none!important;
  transition:none!important;
  will-change:auto!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
.card.layout-tablet .menu-body.sheet-queue .queue-row::before,
.card.layout-tablet .menu-body.sheet-queue .queue-row::after{
  animation:none!important;
  transition:none!important;
}
.menu-body.sheet-queue .queue-row{
  transition:border-color .08s ease, background-color .08s ease, box-shadow .08s ease!important;
}
.menu-body.sheet-queue .queue-row.expanded{
  min-height:126px!important;
  overflow:visible!important;
}
.card.layout-tablet .menu-body.sheet-queue .queue-row.expanded{
  min-height:136px!important;
}
.menu-body.sheet-queue .queue-inline-actions{
  transition:none!important;
}
.theme-light .queue-row.expanded .queue-inline-actions{
  border-color:rgba(147,161,183,.18);
  background:rgba(255,255,255,.72);
}
.theme-light .queue-inline-actions .chip-btn{
  border-color:rgba(147,161,183,.18);
  background:rgba(255,255,255,.68);
  color:#253041;
}
.theme-light .queue-inline-actions .chip-btn.primary{
  border-color:color-mix(in srgb, var(--ma-accent) 44%, rgba(147,161,183,.18));
  background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 86%, white 14%), color-mix(in srgb, var(--ma-accent) 68%, black 32%));
  color:#111827;
}
.theme-light .queue-inline-actions .chip-btn.warn{
  border-color:rgba(220,72,72,.24);
  background:rgba(220,72,72,.11);
  color:#cf4d4d;
}
.card.layout-tablet .menu-sheet.sheet-schedules{width:min(calc(100% - 96px), 1080px)!important;max-width:min(calc(100% - 96px), 1080px)!important;height:calc(100% - 26px)!important;max-height:calc(100% - 26px)!important;}
.card.layout-tablet .menu-body.sheet-schedules{justify-items:stretch!important;align-content:start!important;overflow:auto!important;padding:20px 28px 28px!important;scrollbar-gutter:stable!important;}
.card.layout-tablet .menu-body.sheet-schedules .settings-shell{width:min(100%, 920px)!important;margin:0 auto!important;display:grid!important;grid-template-rows:auto auto!important;gap:18px!important;height:auto!important;min-height:auto!important;overflow:visible!important;}
.card.layout-tablet .schedule-tabs{width:100%!important;max-width:none!important;}
.card.layout-tablet .schedule-content{width:100%!important;display:grid!important;gap:16px!important;align-content:start!important;}
.card.layout-tablet .schedule-panel-card,
.card.layout-tablet .wake-schedule-layout,
.card.layout-tablet .wake-schedule-list-card,
.card.layout-tablet .wake-schedule-editor-card{width:100%!important;max-width:none!important;}
.card.layout-tablet .wake-schedule-layout{height:auto!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:16px!important;overflow:visible!important;align-items:stretch!important;}
.card.layout-tablet .wake-schedule-list-card{max-height:none!important;overflow:visible!important;}
.card.layout-tablet .scheduled-start-grid,
.card.layout-tablet .scheduled-start-grid.two-col,
.card.layout-tablet .night-window-grid{grid-template-columns:minmax(0,1fr)!important;}
.card.layout-tablet .sleep-timer-action-row,
.card.layout-tablet .sleep-timer-action-row.with-cancel{grid-template-columns:repeat(3,minmax(0,1fr))!important;}
.card.layout-tablet .sleep-timer-action-row.with-cancel .danger{grid-column:1 / -1!important;}
.card.layout-tablet .menu-body.sheet-schedules .settings-group,
.card.layout-tablet .menu-body.sheet-schedules .scheduled-start-card,
.card.layout-tablet .menu-body.sheet-schedules .schedule-panel-card,
.card.layout-tablet .menu-body.sheet-schedules .schedule-row,
.card.layout-tablet .menu-body.sheet-schedules .settings-pill,
.card.layout-tablet .menu-body.sheet-schedules .night-time-card,
.card.layout-tablet .menu-body.sheet-schedules .scheduled-start-field,
.card.layout-tablet .menu-body.sheet-schedules select,
.card.layout-tablet .menu-body.sheet-schedules input{
  animation:none!important;
  transition:none!important;
  transform:none!important;
  will-change:auto!important;
}
.card.layout-tablet .menu-body.sheet-schedules select,
.card.layout-tablet .menu-body.sheet-schedules input,
.card.layout-tablet .menu-body.sheet-schedules .settings-pill,
.card.layout-tablet .menu-body.sheet-schedules .night-time-card,
.card.layout-tablet .menu-body.sheet-schedules .scheduled-start-field{
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
.menu-body.sheet-schedules{
  contain:layout paint;
  overscroll-behavior:contain;
}
.menu-body.sheet-schedules select,
.menu-body.sheet-schedules input,
.menu-body.sheet-schedules .night-time-card,
.menu-body.sheet-schedules .scheduled-start-field{
  transform:none!important;
  transition:none!important;
  will-change:auto!important;
}
.menu-body.sheet-schedules select:focus,
.menu-body.sheet-schedules input:focus{
  scroll-margin-block:120px 160px;
}
.menu-body.sheet-schedules .settings-select{
  min-height:58px;
  line-height:1.2;
}
.this-device-strip{width:max-content;max-width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:7px 8px 7px 14px;margin:0 auto 12px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.07);box-shadow:inset 0 1px 0 rgba(255,255,255,.08);white-space:nowrap;direction:inherit;}
.this-device-copy{min-width:0;display:inline-flex;align-items:center;gap:7px;text-align:start;}
.this-device-title{font-size:calc(12px * var(--v2-font-scale));font-weight:900;color:rgba(255,255,255,.9);white-space:nowrap;line-height:1;}
.this-device-status{display:inline-flex;align-items:center;min-height:24px;padding:0 9px;border-radius:999px;background:rgba(255,255,255,.09);color:rgba(255,255,255,.68);font-size:calc(10px * var(--v2-font-scale));font-weight:900;white-space:nowrap;}
.this-device-toggle{flex:0 0 auto;display:inline-flex;align-items:center;gap:6px;min-height:34px;padding:3px 5px 3px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(12,16,24,.34);color:#fff;font-size:calc(11px * var(--v2-font-scale));font-weight:900;cursor:pointer;touch-action:manipulation;box-shadow:0 10px 22px rgba(0,0,0,.14),inset 0 1px 0 rgba(255,255,255,.08);}
.this-device-toggle.active{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .18);border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .28);}
.this-device-toggle:disabled{cursor:default;opacity:.88;}
.this-device-strip.disconnecting .this-device-toggle{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.12);}
.this-device-strip.connected .this-device-toggle{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .2);border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .34);}
.this-device-toggle-knob{width:26px;height:26px;border-radius:999px;display:grid;place-items:center;background:rgba(255,255,255,.12);}
.this-device-toggle-knob .ui-ic{width:14px;height:14px;}
.theme-light .this-device-strip{background:rgba(255,255,255,.72);border-color:rgba(135,150,172,.18);box-shadow:0 14px 30px rgba(111,126,150,.1);}
.theme-light .this-device-title{color:#1f2937;}
.theme-light .this-device-status{color:#66758a;background:rgba(31,41,55,.08);}
.theme-light .this-device-toggle{color:#1f2937;background:rgba(238,242,247,.92);border-color:rgba(128,145,168,.2);}
.theme-light .this-device-toggle.active{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .16);border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .26);}
.card.layout-mobile .this-device-strip{padding:6px 7px 6px 12px;border-radius:999px;gap:8px;}
.card.layout-mobile .this-device-toggle{max-width:none;padding-inline-start:9px;}
.card.layout-mobile .this-device-toggle span:first-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
@media (max-width: 1280px){
  .control-room-layout{gap:10px;}
  .control-room-grid-wrap{padding:24px 20px 0;}
  .control-room-grid{max-width:var(--control-room-grid-max-width, 100%);}
  .control-room-tile.selected{transform:none;}
  .control-room-tray{inset-block-end:128px;width:min(1080px, calc(100% - 36px));max-height:calc(100dvh - 220px);}
  .control-room-tray.compact{width:min(680px, calc(100% - 36px));}
  .control-room-picker-list,.control-room-library-results{max-height:calc(100dvh - 300px);}
  .control-room-transfer-list{max-height:calc(50dvh - 72px);}
  .control-room-dock{padding:12px 14px calc(14px + env(safe-area-inset-bottom, 0px));gap:10px;max-width:calc(100% - 2px);}
  .control-room-now-pill{min-width:220px;max-width:260px;}
  .control-room-dock-btn,.control-room-selection-pill{width:auto;height:50px;min-width:50px;}
  .control-room-dock-btn.library-pill{min-width:52px;padding:0;}
  .control-room-dock-divider{display:none;}
  .control-room-dock-section{padding:6px 8px;}
}
@media (max-width:760px){
  .control-room-grid-wrap{padding:18px 10px 0;}
  .control-room-tray{inset-block-end:112px;width:calc(100% - 16px);max-height:calc(100dvh - 206px);padding:12px;border-radius:24px;z-index:32;}
  .control-room-tray.compact,.control-room-tray.wide{width:calc(100% - 16px);}
  .control-room-transfer-board{grid-template-columns:minmax(0,1fr);gap:10px;}
  .control-room-transfer-arrow{display:none;}
  .control-room-transfer-action{width:100%;height:50px;}
  .control-room-tray.transfer-panel .control-room-transfer-list{max-height:min(30dvh, 220px);}
  .control-room-picker-list,.control-room-library-results{max-height:calc(100dvh - 320px);}
}

.control-room-tile-actions{position:relative;z-index:2;display:flex;align-items:center;gap:6px;align-self:end;justify-self:end;margin-top:-44px;margin-inline-end:2px;}
.control-room-tile-actions button{width:34px;height:34px;border-radius:13px;border:1px solid rgba(255,255,255,.14);background:rgba(12,15,22,.42);color:#fff;display:grid;place-items:center;box-shadow:0 10px 24px rgba(0,0,0,.18);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);cursor:pointer;}
.control-room-tile-actions button.active{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .26);border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .36);}
.control-room-tile-actions .ui-ic{width:17px;height:17px;}
.control-room-float-pill .ui-ic{width:13px;height:13px;margin-inline-end:4px;}
.control-room-float-pill.protocol{text-transform:uppercase;letter-spacing:.02em;}
.theme-light .control-room-tile-actions button{background:rgba(255,255,255,.76);border-color:rgba(28,42,68,.1);color:#1b2740;}
.control-room-dock{justify-content:flex-start;overflow-x:auto;overflow-y:visible;scrollbar-width:none;}
.control-room-dock::-webkit-scrollbar{display:none;}
.card.layout-tablet .control-room-dock{justify-content:flex-start!important;overflow-x:auto!important;overflow-y:visible!important;flex-wrap:nowrap!important;}
.card.layout-tablet .control-room-dock-section{flex:0 0 auto;}
.control-room-dock-btn.danger,.control-room-panel-action.danger{background:rgba(222,72,72,.16)!important;border-color:rgba(255,105,105,.24)!important;color:#ffb6b6!important;}
.control-room-dock-section.selected{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .07);}
.control-room-panel-action{min-height:52px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.07);color:#fff;display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:0 16px;font-size:calc(13px * var(--v2-font-scale));font-weight:900;cursor:pointer;touch-action:manipulation;}
.control-room-panel-action.primary{background:linear-gradient(135deg, rgba(var(--dynamic-accent-rgb,245 166 35) / .38), rgba(128,88,210,.46));border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .34);box-shadow:0 16px 36px rgba(var(--dynamic-accent-rgb,245 166 35) / .16);}
.control-room-panel-action.wide{width:100%;}
.control-room-panel-action:disabled{opacity:.45;cursor:not-allowed;}
.theme-light .control-room-panel-action{background:rgba(255,255,255,.78);border-color:rgba(28,42,68,.1);color:#17253a;}
.control-room-queue-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;flex-wrap:wrap;}
.control-room-queue-preview{display:grid;gap:8px;margin-top:10px;padding:10px;border-radius:20px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.09);max-height:190px;overflow:auto;}
.control-room-queue-preview-head{display:flex;align-items:center;justify-content:space-between;gap:10px;}
.control-room-queue-player{font-size:calc(12px * var(--v2-font-scale));font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.control-room-queue-count{min-width:30px;height:24px;border-radius:999px;display:inline-grid;place-items:center;padding:0 8px;background:rgba(var(--dynamic-accent-rgb,245 166 35) / .18);font-weight:900;color:#fff;}
.control-room-queue-row{display:grid;grid-template-columns:36px minmax(0,1fr);align-items:center;gap:9px;min-height:42px;padding:5px;border-radius:14px;background:rgba(255,255,255,.045);}
.control-room-queue-row.current{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .14);}
.control-room-queue-art{width:36px;height:36px;border-radius:11px;overflow:hidden;display:grid;place-items:center;background:rgba(255,255,255,.08);color:#fff;}
.control-room-queue-art img{width:100%;height:100%;object-fit:cover;display:block;}
.control-room-queue-copy{min-width:0;display:grid;gap:2px;}
.control-room-queue-title,.control-room-queue-sub{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.control-room-queue-title{font-size:calc(12px * var(--v2-font-scale));font-weight:850;color:#fff;}
.control-room-queue-sub{font-size:calc(10px * var(--v2-font-scale));color:rgba(255,255,255,.62);}
.theme-light .control-room-queue-preview,.theme-light .control-room-queue-row{background:rgba(255,255,255,.72);border-color:rgba(28,42,68,.08);}
.theme-light .control-room-queue-player,.theme-light .control-room-queue-title{color:#17253a;}
.theme-light .control-room-queue-sub{color:#71829a;}
.control-room-media-grid.large{grid-template-columns:repeat(auto-fit,minmax(180px,1fr));}
.control-room-media-card{display:grid;grid-template-rows:minmax(0,1fr) auto;gap:10px;min-height:236px;}
.control-room-media-card.liked{border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .28);}
.control-room-media-main{display:grid;gap:10px;padding:0;background:none;border:0;color:inherit;text-align:inherit;cursor:pointer;min-width:0;}
.control-room-media-kicker{font-size:calc(10px * var(--v2-font-scale));font-weight:900;color:rgba(var(--dynamic-accent-rgb,245 166 35) / .9);text-transform:uppercase;}
.control-room-media-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.control-room-media-action{height:32px;min-width:52px;padding:0 10px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.075);color:#fff;font-size:calc(10px * var(--v2-font-scale));font-weight:900;cursor:pointer;}
.control-room-media-action.primary{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .24);border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .32);}
.control-room-media-action.icon{min-width:32px;width:32px;padding:0;display:grid;place-items:center;}
.control-room-media-action.icon .ui-ic{width:15px;height:15px;}
.control-room-media-action.active{color:var(--ma-accent);}
.theme-light .control-room-media-action{background:rgba(245,248,252,.94);border-color:rgba(28,42,68,.08);color:#1b2740;}
.control-room-mix-panel,.control-room-announce-panel,.control-room-diagnostics{display:grid;gap:14px;min-width:0;}
.control-room-mix-grid,.control-room-scenes-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;}
.control-room-mix-card,.control-room-scene-card{min-height:122px;border-radius:24px;border:1px solid rgba(255,255,255,.1);background:linear-gradient(145deg, rgba(255,255,255,.09), rgba(255,255,255,.035));color:#fff;display:grid;align-content:center;justify-items:center;gap:7px;padding:14px;text-align:center;box-shadow:0 16px 34px rgba(0,0,0,.16);cursor:pointer;}
.control-room-mix-card:hover,.control-room-scene-card:hover{border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .32);background:rgba(var(--dynamic-accent-rgb,245 166 35) / .12);}
.control-room-mix-icon{width:46px;height:46px;border-radius:17px;display:grid;place-items:center;background:rgba(var(--dynamic-accent-rgb,245 166 35) / .18);color:var(--ma-accent);}
.control-room-mix-title,.control-room-scene-card span{font-size:calc(16px * var(--v2-font-scale));font-weight:950;}
.control-room-mix-sub,.control-room-scene-card small{font-size:calc(11px * var(--v2-font-scale));font-weight:700;color:rgba(255,255,255,.62);}
.control-room-scene-card .ui-ic{width:30px;height:30px;color:var(--ma-accent);}
.theme-light .control-room-mix-card,.theme-light .control-room-scene-card{background:rgba(255,255,255,.76);border-color:rgba(28,42,68,.08);color:#17253a;}
.theme-light .control-room-mix-sub,.theme-light .control-room-scene-card small{color:#71829a;}
.control-room-diagnostic-row{min-height:44px;border-radius:16px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 14px;color:#fff;}
.control-room-diagnostic-row span{font-size:calc(12px * var(--v2-font-scale));color:rgba(255,255,255,.64);font-weight:800;}
.control-room-diagnostic-row strong{font-size:calc(12px * var(--v2-font-scale));font-weight:950;color:#fff;}
.control-room-pro-actions{display:flex;gap:10px;flex-wrap:wrap;}
.theme-light .control-room-diagnostic-row{background:rgba(255,255,255,.72);color:#17253a;}
.theme-light .control-room-diagnostic-row span{color:#71829a;}
.theme-light .control-room-diagnostic-row strong{color:#17253a;}

.control-room-dock.focus-mode{gap:12px;max-width:min(1180px, calc(100% - 24px));justify-content:center;overflow:visible;padding:10px 14px calc(12px + env(safe-area-inset-bottom, 0px));}
.control-room-dock.focus-mode .control-room-now-pill{min-width:min(360px, 38vw);max-width:420px;background:linear-gradient(145deg, rgba(255,255,255,.09), rgba(255,255,255,.035));}
.control-room-dock.focus-mode .control-room-dock-section{background:rgba(255,255,255,.045);}
.control-room-dock.focus-mode .focus-nav{padding:7px;gap:8px;}
.control-room-dock.focus-mode .primary-actions{padding:7px;gap:8px;}
.control-room-dock.focus-mode .control-room-dock-btn,.control-room-dock.focus-mode .control-room-selection-pill{min-width:76px;height:56px;border-radius:18px;}
.control-room-dock.focus-mode .control-room-selection-pill{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .22);border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .28);}
.control-room-context-chip{display:inline-flex;align-items:center;gap:10px;justify-self:start;max-width:100%;padding:8px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.065);color:#fff;box-shadow:0 12px 24px rgba(0,0,0,.12);}
.control-room-context-art{width:34px;height:34px;border-radius:12px;display:grid;place-items:center;overflow:hidden;background:rgba(255,255,255,.08);flex:none;}
.control-room-context-art img{width:100%;height:100%;object-fit:cover;display:block;}
.control-room-context-art .ui-ic{width:16px;height:16px;}
.control-room-context-copy{display:grid;gap:1px;min-width:0;}
.control-room-context-kicker{font-size:calc(10px * var(--v2-font-scale));font-weight:850;color:rgba(255,255,255,.58);white-space:nowrap;}
.control-room-context-name{font-size:calc(13px * var(--v2-font-scale));font-weight:950;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.control-room-hub-panel{grid-template-rows:auto auto minmax(0,1fr);}
.control-room-hub-grid,.control-room-action-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(178px,1fr));gap:12px;min-height:0;overflow:auto;padding-inline-end:2px;scrollbar-width:thin;}
.control-room-action-grid{grid-template-columns:repeat(auto-fit,minmax(160px,1fr));}
.control-room-hub-card{min-height:118px;padding:16px;border-radius:24px;border:1px solid rgba(255,255,255,.1);background:linear-gradient(145deg, rgba(255,255,255,.085), rgba(255,255,255,.035));color:#fff;display:grid;align-content:center;justify-items:start;gap:7px;text-align:start;box-shadow:0 16px 34px rgba(0,0,0,.14);cursor:pointer;touch-action:manipulation;}
.control-room-hub-card.primary{background:linear-gradient(145deg, rgba(var(--dynamic-accent-rgb,245 166 35) / .28), rgba(128,88,210,.24));border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .32);}
.control-room-hub-card.danger{background:rgba(222,72,72,.13);border-color:rgba(255,105,105,.22);color:#ffb6b6;}
.control-room-hub-card:disabled{opacity:.44;cursor:not-allowed;}
.control-room-hub-card .ui-ic{width:28px;height:28px;color:var(--ma-accent);}
.control-room-hub-card span{font-size:calc(16px * var(--v2-font-scale));font-weight:950;line-height:1.05;}
.control-room-hub-card small{font-size:calc(11px * var(--v2-font-scale));font-weight:750;color:rgba(255,255,255,.62);line-height:1.25;}
.control-room-announcement-tray{width:min(780px, calc(100% - 44px));grid-template-rows:auto auto auto;gap:14px;}
.control-room-announce-hero{display:flex;align-items:center;gap:14px;min-width:0;padding:6px 4px 0;}
.control-room-announce-icon{width:54px;height:54px;border-radius:20px;display:grid;place-items:center;flex:none;background:linear-gradient(145deg, rgba(var(--dynamic-accent-rgb,245 166 35) / .24), rgba(128,88,210,.24));border:1px solid rgba(var(--dynamic-accent-rgb,245 166 35) / .22);color:#fff;}
.control-room-announce-icon .ui-ic{width:25px;height:25px;}
.control-room-announce-copy{display:grid;gap:4px;min-width:0;}
.control-room-announce-panel{display:grid;gap:14px;}
.control-room-announce-compose{display:grid;gap:8px;font-size:calc(12px * var(--v2-font-scale));font-weight:900;color:rgba(255,255,255,.7);}
.control-room-announce-compose .announcement-textarea{width:100%;min-height:122px;resize:vertical;border-radius:22px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.075);color:#fff;padding:16px 18px;font:inherit;font-weight:700;outline:none;box-sizing:border-box;}
.control-room-announce-compose .announcement-textarea:focus{border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .38);box-shadow:0 0 0 3px rgba(var(--dynamic-accent-rgb,245 166 35) / .12);}
.control-room-announce-controls{display:grid;grid-template-columns:minmax(0,1fr) minmax(180px, .42fr);gap:12px;align-items:stretch;}
.control-room-announce-volume-card{display:grid;align-content:center;gap:12px;min-height:82px;padding:14px 16px;border-radius:22px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.055);}
.control-room-announce-volume-head{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:calc(12px * var(--v2-font-scale));font-weight:900;color:rgba(255,255,255,.7);}
.control-room-announce-volume-head strong{font-size:calc(16px * var(--v2-font-scale));font-weight:950;color:#fff;}
.control-room-announce-send{min-height:82px;border-radius:22px;font-size:calc(14px * var(--v2-font-scale));}
.control-room-tile-actions{opacity:0;pointer-events:none;transform:translateY(4px);transition:opacity .16s ease,transform .16s ease;}
.control-room-tile:hover .control-room-tile-actions,.control-room-tile.selected .control-room-tile-actions,.control-room-tile.is-playing .control-room-tile-actions{opacity:1;pointer-events:auto;transform:translateY(0);}
.theme-light .control-room-context-chip,.theme-light .control-room-hub-card,.theme-light .control-room-announce-volume-card{background:rgba(255,255,255,.76);border-color:rgba(28,42,68,.08);color:#17253a;}
.theme-light .control-room-context-kicker,.theme-light .control-room-hub-card small,.theme-light .control-room-announce-compose,.theme-light .control-room-announce-volume-head{color:#71829a;}
.theme-light .control-room-context-name,.theme-light .control-room-announce-volume-head strong{color:#17253a;}
.theme-light .control-room-announce-compose .announcement-textarea{background:rgba(245,248,252,.94);border-color:rgba(28,42,68,.1);color:#17253a;}
@media (max-width: 980px){
  .control-room-dock.focus-mode{justify-content:flex-start;overflow-x:auto;overflow-y:visible;max-width:calc(100% - 12px);}
  .control-room-dock.focus-mode .control-room-now-pill{display:flex!important;min-width:230px;max-width:280px;}
  .control-room-announce-controls{grid-template-columns:minmax(0,1fr);}
  .control-room-hub-grid,.control-room-action-grid{grid-template-columns:repeat(auto-fit,minmax(142px,1fr));}
}
@media (max-height: 620px){
  .control-room-dock.focus-mode .control-room-now-pill{display:none!important;}
  .control-room-hub-card{min-height:96px;}
  .control-room-announcement-tray{max-height:calc(100dvh - 116px);}
  .control-room-announce-compose .announcement-textarea{min-height:86px;}
}

.control-room-scene{
  --cr-panel-bg:rgba(17,19,25,.965);
  --cr-panel-bg-soft:rgba(255,255,255,.065);
  --cr-panel-bg-raised:linear-gradient(145deg, rgba(255,255,255,.105), rgba(255,255,255,.045));
  --cr-border:rgba(255,255,255,.13);
  --cr-border-strong:rgba(255,255,255,.18);
  --cr-text:#fff;
  --cr-muted:rgba(255,255,255,.64);
  --cr-faint:rgba(255,255,255,.46);
  --cr-radius:24px;
  --cr-icon-box:48px;
  --cr-icon-size:22px;
  --cr-action-height:56px;
}
.theme-light .control-room-scene{
  --cr-panel-bg:rgba(250,252,255,.975);
  --cr-panel-bg-soft:rgba(255,255,255,.78);
  --cr-panel-bg-raised:linear-gradient(145deg, rgba(255,255,255,.96), rgba(241,246,252,.88));
  --cr-border:rgba(27,41,66,.1);
  --cr-border-strong:rgba(27,41,66,.15);
  --cr-text:#17253a;
  --cr-muted:#71829a;
  --cr-faint:#8a98aa;
}
.control-room-scene.panel-open .control-room-tray,
.control-room-tray{
  background:var(--cr-panel-bg)!important;
  border-color:var(--cr-border-strong)!important;
  box-shadow:0 28px 80px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.08)!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
  padding:22px!important;
  gap:16px!important;
}
.control-room-tray.wide{width:min(1120px, calc(100% - 64px))!important;}
.control-room-tray.compact{width:min(780px, calc(100% - 64px))!important;}
.control-room-tray-title{font-size:calc(18px * var(--v2-font-scale))!important;font-weight:950!important;line-height:1.08!important;color:var(--cr-text)!important;}
.control-room-tray-sub{font-size:calc(12px * var(--v2-font-scale))!important;font-weight:750!important;line-height:1.35!important;color:var(--cr-muted)!important;max-width:720px;}
.control-room-context-chip{background:var(--cr-panel-bg-soft)!important;border-color:var(--cr-border)!important;color:var(--cr-text)!important;padding:9px 13px!important;}
.control-room-context-art{width:38px!important;height:38px!important;border-radius:14px!important;background:rgba(255,255,255,.09)!important;}
.control-room-context-art .ui-ic{width:18px!important;height:18px!important;}
.control-room-context-kicker{font-size:calc(10px * var(--v2-font-scale))!important;color:var(--cr-muted)!important;}
.control-room-context-name{font-size:calc(14px * var(--v2-font-scale))!important;color:var(--cr-text)!important;}
.control-room-hub-grid,.control-room-action-grid{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))!important;gap:14px!important;align-content:start;}
.control-room-hub-card,
.control-room-mix-card,
.control-room-scene-card{
  min-height:112px!important;
  border-radius:var(--cr-radius)!important;
  border-color:var(--cr-border)!important;
  background:var(--cr-panel-bg-raised)!important;
  color:var(--cr-text)!important;
  box-shadow:0 18px 38px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.08)!important;
  display:grid!important;
  grid-template-columns:var(--cr-icon-box) minmax(0,1fr)!important;
  grid-template-rows:auto auto!important;
  align-content:center!important;
  align-items:center!important;
  justify-items:start!important;
  column-gap:14px!important;
  row-gap:4px!important;
  text-align:start!important;
  padding:16px!important;
}
.control-room-hub-card.primary,
.control-room-panel-action.primary{background:linear-gradient(145deg, rgba(var(--dynamic-accent-rgb,245 166 35) / .3), rgba(128,88,210,.28))!important;border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .34)!important;}
.control-room-hub-card.danger{background:rgba(222,72,72,.15)!important;border-color:rgba(255,105,105,.24)!important;color:#ffb6b6!important;}
.control-room-hub-card > .ui-ic,
.control-room-mix-icon,
.control-room-scene-card > .ui-ic{
  grid-row:1 / span 2!important;
  width:var(--cr-icon-box)!important;
  height:var(--cr-icon-box)!important;
  border-radius:17px!important;
  display:grid!important;
  place-items:center!important;
  background:rgba(var(--dynamic-accent-rgb,245 166 35) / .16)!important;
  color:var(--ma-accent)!important;
}
.control-room-hub-card > .ui-ic,
.control-room-scene-card > .ui-ic{padding:12px!important;box-sizing:border-box;}
.control-room-hub-card > .ui-ic *,
.control-room-scene-card > .ui-ic *{vector-effect:non-scaling-stroke;}
.control-room-mix-icon .ui-ic{width:var(--cr-icon-size)!important;height:var(--cr-icon-size)!important;}
.control-room-hub-card span:not(.ui-ic),
.control-room-mix-title,
.control-room-scene-card span:not(.ui-ic){
  font-size:calc(15px * var(--v2-font-scale))!important;
  font-weight:950!important;
  line-height:1.1!important;
  color:var(--cr-text)!important;
  white-space:normal!important;
}
.control-room-hub-card small,
.control-room-mix-sub,
.control-room-scene-card small{
  font-size:calc(11px * var(--v2-font-scale))!important;
  font-weight:760!important;
  line-height:1.28!important;
  color:var(--cr-muted)!important;
}
.control-room-picker-row,
.control-room-transfer-choice,
.control-room-media-card,
.control-room-queue-preview,
.control-room-diagnostic-row,
.control-room-announce-volume-card,
.control-room-announce-compose .announcement-textarea,
.control-room-search{
  background:var(--cr-panel-bg-soft)!important;
  border-color:var(--cr-border)!important;
  color:var(--cr-text)!important;
}
.control-room-picker-row,.control-room-transfer-choice{min-height:68px!important;border-radius:22px!important;padding:9px 12px!important;}
.control-room-picker-art,.control-room-transfer-art{width:48px!important;height:48px!important;border-radius:16px!important;}
.control-room-picker-art .ui-ic,.control-room-transfer-art .ui-ic{width:20px!important;height:20px!important;}
.control-room-picker-title,.control-room-transfer-title,.control-room-media-title,.control-room-queue-title{font-size:calc(13px * var(--v2-font-scale))!important;font-weight:920!important;color:var(--cr-text)!important;}
.control-room-picker-sub,.control-room-transfer-sub,.control-room-media-sub,.control-room-queue-sub{font-size:calc(11px * var(--v2-font-scale))!important;font-weight:720!important;color:var(--cr-muted)!important;}
.control-room-panel-action,
.control-room-media-action{
  min-height:var(--cr-action-height)!important;
  border-radius:18px!important;
  border-color:var(--cr-border)!important;
  background:var(--cr-panel-bg-soft)!important;
  color:var(--cr-text)!important;
  font-size:calc(12px * var(--v2-font-scale))!important;
  font-weight:900!important;
}
.control-room-panel-action .ui-ic{width:19px!important;height:19px!important;}
.control-room-media-action{height:36px!important;min-height:36px!important;min-width:58px!important;border-radius:13px!important;}
.control-room-dock.focus-mode{background:rgba(12,15,21,.92)!important;border-color:var(--cr-border)!important;box-shadow:0 24px 60px rgba(0,0,0,.34)!important;}
.control-room-dock.focus-mode .control-room-now-pill,
.control-room-dock.focus-mode .control-room-dock-section{background:rgba(255,255,255,.07)!important;border-color:var(--cr-border)!important;}
.control-room-dock.focus-mode .control-room-dock-btn,
.control-room-dock.focus-mode .control-room-selection-pill{height:58px!important;min-width:78px!important;border-radius:18px!important;background:rgba(255,255,255,.075)!important;border-color:var(--cr-border)!important;}
.control-room-dock.focus-mode .control-room-dock-btn.active,
.control-room-dock.focus-mode .control-room-selection-pill.active{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .26)!important;border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .34)!important;}
.control-room-dock-btn .ui-ic{width:20px!important;height:20px!important;}
.control-room-dock-label{font-size:calc(10px * var(--v2-font-scale))!important;font-weight:900!important;}
.control-room-announcement-tray{width:min(760px, calc(100% - 64px))!important;}
.control-room-announce-icon{width:50px!important;height:50px!important;border-radius:17px!important;}
.control-room-announce-icon .ui-ic{width:22px!important;height:22px!important;}
.control-room-announce-compose .announcement-textarea{min-height:112px!important;color:var(--cr-text)!important;font-size:calc(13px * var(--v2-font-scale))!important;}
.control-room-announce-send{min-height:78px!important;}
.theme-light .control-room-dock.focus-mode{background:rgba(250,252,255,.96)!important;}
@media (max-width:980px){
  .control-room-tray.wide,.control-room-tray.compact,.control-room-announcement-tray{width:calc(100% - 24px)!important;padding:16px!important;}
  .control-room-hub-grid,.control-room-action-grid{grid-template-columns:repeat(auto-fit,minmax(158px,1fr))!important;gap:10px!important;}
  .control-room-hub-card,.control-room-mix-card,.control-room-scene-card{min-height:100px!important;grid-template-columns:42px minmax(0,1fr)!important;padding:13px!important;column-gap:11px!important;}
  .control-room-hub-card > .ui-ic,.control-room-mix-icon,.control-room-scene-card > .ui-ic{width:42px!important;height:42px!important;border-radius:15px!important;}
}

.control-room-player-console{
  display:flex;
  align-items:center;
  gap:10px;
  min-width:min(620px, 52vw);
  max-width:min(720px, 58vw);
  padding:8px;
  border-radius:28px;
  border:1px solid var(--cr-border)!important;
  background:linear-gradient(145deg, rgba(255,255,255,.09), rgba(255,255,255,.045))!important;
  box-shadow:0 18px 44px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.08);
  min-height:78px;
}
.control-room-dock.focus-mode .control-room-player-console .control-room-now-pill,
.control-room-dock.focus-mode .control-room-player-console .control-room-dock-section{
  background:transparent!important;
  border-color:transparent!important;
  box-shadow:none!important;
}
.control-room-player-console .control-room-now-pill{
  flex:1 1 260px;
  min-width:220px!important;
  max-width:none!important;
  padding:4px 8px!important;
}
.control-room-player-console .control-room-now-art{width:54px!important;height:54px!important;border-radius:18px!important;}
.control-room-player-console .control-room-now-name{font-size:calc(15px * var(--v2-font-scale))!important;font-weight:950!important;}
.control-room-player-console .control-room-now-track{font-size:calc(12px * var(--v2-font-scale))!important;}
.control-room-player-console .primary-actions{
  flex:0 0 auto;
  padding:0!important;
  gap:8px!important;
}
.control-room-player-console .primary-actions .control-room-dock-btn{min-width:72px!important;}
.theme-light .control-room-player-console{background:linear-gradient(145deg, rgba(255,255,255,.96), rgba(241,246,252,.84))!important;}

.control-room-tray.transfer-panel{
  width:min(1240px, calc(100% - 64px))!important;
  max-height:min(76vh, 740px)!important;
  grid-template-rows:auto minmax(0,1fr)!important;
}
.control-room-queue-layout{
  display:grid;
  grid-template-rows:minmax(0, 1fr) minmax(132px, .56fr) auto;
  gap:14px;
  min-height:0;
  overflow:hidden;
}
.control-room-transfer-board.control-room-transfer-selectors{
  grid-template-columns:minmax(0,1fr) 52px minmax(0,1fr)!important;
  align-items:stretch!important;
  gap:14px!important;
  min-height:0;
}
.control-room-transfer-selectors .control-room-transfer-column{
  grid-template-rows:auto minmax(0,1fr)!important;
  min-height:0!important;
}
.control-room-tray.transfer-panel .control-room-transfer-list{
  max-height:270px!important;
  height:100%;
}
.control-room-queue-preview-board{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:14px;
  min-height:0;
}
.control-room-queue-preview-column{
  display:grid;
  grid-template-rows:auto minmax(0,1fr);
  gap:8px;
  min-width:0;
  min-height:0;
}
.control-room-tray.transfer-panel .control-room-queue-preview{
  margin-top:0!important;
  max-height:none!important;
  min-height:132px;
  height:100%;
  overflow:auto;
}
.control-room-queue-preview-column .control-room-empty{height:100%;display:grid;place-items:center;}
.control-room-tray.transfer-panel .control-room-queue-actions{justify-content:flex-end;padding-top:2px;}

.control-room-tile.grouped{
  border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .36)!important;
  box-shadow:0 20px 46px rgba(0,0,0,.24), 0 0 0 1px rgba(var(--dynamic-accent-rgb,245 166 35) / .11) inset!important;
}
.control-room-tile.grouped::after{
  content:"";
  position:absolute;
  inset:auto 18px 12px 18px;
  height:3px;
  border-radius:999px;
  background:linear-gradient(90deg, transparent, rgba(var(--dynamic-accent-rgb,245 166 35) / .7), transparent);
  pointer-events:none;
}
.control-room-float-pill.grouped{
  gap:4px;
  background:rgba(var(--dynamic-accent-rgb,245 166 35) / .22)!important;
  border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .32)!important;
  color:#fff!important;
}
.control-room-float-pill.grouped .ui-ic{width:12px!important;height:12px!important;}
.control-room-tile .control-room-select-fab{
  width:auto!important;
  min-width:86px!important;
  height:42px!important;
  padding:0 11px!important;
  grid-template-columns:auto auto;
  gap:6px;
  border-radius:999px!important;
  z-index:6!important;
  background:rgba(9,12,18,.48)!important;
  border-color:rgba(255,255,255,.16)!important;
}
.control-room-tile .control-room-select-fab.active{
  background:rgba(var(--dynamic-accent-rgb,245 166 35) / .28)!important;
  border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .42)!important;
}
.control-room-tile .control-room-select-fab.removable{
  background:rgba(222,72,72,.2)!important;
  border-color:rgba(255,105,105,.32)!important;
  color:#ffd1d1!important;
}
.control-room-select-label{
  font-size:calc(10px * var(--v2-font-scale));
  font-weight:950;
  line-height:1;
  white-space:nowrap;
}
.control-room-tile.grouped .control-room-tile-copy{
  box-shadow:0 0 0 1px rgba(var(--dynamic-accent-rgb,245 166 35) / .14),0 14px 30px rgba(0,0,0,.24)!important;
}
.control-room-tile.grouped .control-room-float-pill.grouped{
  font-size:calc(10px * var(--v2-font-scale))!important;
  padding-inline:9px!important;
}
.theme-light .control-room-tile .control-room-select-fab{background:rgba(255,255,255,.78)!important;border-color:rgba(27,41,66,.1)!important;color:#17253a!important;}
.theme-light .control-room-tile .control-room-select-fab.removable{background:rgba(255,235,235,.9)!important;border-color:rgba(210,62,62,.22)!important;color:#b94a4a!important;}

@media (max-width:980px){
  .control-room-player-console{
    min-width:min(540px, 72cqi);
    max-width:none;
    flex:0 0 auto;
  }
  .control-room-tray.transfer-panel{
    width:calc(100% - 24px)!important;
    max-height:calc(100dvh - 190px)!important;
  }
  .control-room-queue-layout{
    grid-template-rows:auto auto auto;
    overflow:auto;
  }
  .control-room-transfer-board.control-room-transfer-selectors,
  .control-room-queue-preview-board{
    grid-template-columns:minmax(0,1fr)!important;
  }
  .control-room-transfer-selectors .control-room-transfer-arrow{display:none!important;}
  .control-room-tray.transfer-panel .control-room-transfer-list{max-height:190px!important;}
  .control-room-tray.transfer-panel .control-room-queue-preview{max-height:180px!important;height:auto;}
}
@media (max-width:720px){
  .control-room-tile .control-room-select-fab{min-width:76px!important;height:38px!important;padding-inline:9px!important;}
  .control-room-select-label{font-size:9px!important;}
  .control-room-player-console{
    min-width:calc(100cqi - 34px);
    flex-wrap:wrap;
    justify-content:space-between;
  }
  .control-room-player-console .control-room-now-pill{flex:1 1 100%;min-width:0!important;}
  .control-room-player-console .primary-actions{width:100%;justify-content:space-between;}
  .control-room-player-console .primary-actions .control-room-dock-btn{flex:1 1 0;min-width:0!important;}
}

.control-room-action-console{
  display:grid;
  grid-template-columns:minmax(260px,.95fr) minmax(0,1.35fr);
  align-items:center;
  gap:16px;
  min-height:118px;
  padding:16px;
  border-radius:28px;
  border:1px solid var(--cr-border-strong)!important;
  background:linear-gradient(145deg, rgba(255,255,255,.09), rgba(255,255,255,.04))!important;
  box-shadow:0 22px 54px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.08);
}
.control-room-action-now{
  display:flex;
  align-items:center;
  gap:14px;
  min-width:0;
}
.control-room-action-art{
  width:72px;
  height:72px;
  border-radius:22px;
  overflow:hidden;
  display:grid;
  place-items:center;
  flex:none;
  background:rgba(255,255,255,.08);
  border:1px solid var(--cr-border);
}
.control-room-action-art img{width:100%;height:100%;object-fit:cover;display:block;}
.control-room-action-art .ui-ic{width:30px;height:30px;color:var(--ma-accent);}
.control-room-action-copy{display:grid;gap:4px;min-width:0;}
.control-room-action-kicker{font-size:calc(11px * var(--v2-font-scale));font-weight:900;color:var(--cr-muted);}
.control-room-action-name{font-size:calc(18px * var(--v2-font-scale));font-weight:950;line-height:1.05;color:var(--cr-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.control-room-action-track{font-size:calc(12px * var(--v2-font-scale));font-weight:760;color:var(--cr-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.control-room-media-controls{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:10px;
  padding:8px;
  border-radius:24px;
  background:rgba(7,9,14,.28);
  border:1px solid rgba(255,255,255,.08);
}
.control-room-media-control{
  min-height:72px;
  border-radius:20px;
  border:1px solid var(--cr-border)!important;
  background:rgba(255,255,255,.07)!important;
  color:var(--cr-text)!important;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:7px;
  font-size:calc(12px * var(--v2-font-scale));
  font-weight:950;
  cursor:pointer;
  touch-action:manipulation;
}
.control-room-media-control .ui-ic{width:22px;height:22px;}
.control-room-media-control.primary,.control-room-media-control.active{
  background:rgba(var(--dynamic-accent-rgb,245 166 35) / .24)!important;
  border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .36)!important;
  box-shadow:0 16px 32px rgba(var(--dynamic-accent-rgb,245 166 35) / .12);
}
.control-room-media-control.danger{
  background:rgba(222,72,72,.16)!important;
  border-color:rgba(255,105,105,.26)!important;
  color:#ffc2c2!important;
}
.control-room-media-control:disabled{opacity:.42;cursor:not-allowed;}
.control-room-action-grid.management{
  grid-template-columns:repeat(auto-fit,minmax(210px,1fr))!important;
}
.control-room-action-grid.management .control-room-hub-card{min-height:100px!important;}

.control-room-tray.transfer-panel{
  width:min(1120px, calc(100% - 90px))!important;
  max-height:min(72vh, 690px)!important;
}
.control-room-tray.transfer-panel .control-room-tray-head{
  max-width:760px;
}
.control-room-tray.transfer-panel .control-room-queue-layout{
  grid-template-rows:minmax(0,1fr) auto!important;
  gap:16px!important;
  overflow:hidden!important;
}
.control-room-queue-lanes{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:16px;
  min-height:0;
}
.control-room-queue-lane{
  display:grid;
  grid-template-rows:auto minmax(120px,.45fr) auto minmax(132px,.55fr);
  gap:10px;
  min-width:0;
  min-height:0;
  padding:14px;
  border-radius:26px;
  border:1px solid var(--cr-border)!important;
  background:linear-gradient(145deg, rgba(255,255,255,.075), rgba(255,255,255,.035))!important;
  box-shadow:0 18px 42px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.06);
}
.control-room-queue-lane-head{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:14px;
  min-width:0;
  padding-inline:2px;
}
.control-room-queue-lane-head span{
  font-size:calc(11px * var(--v2-font-scale));
  font-weight:950;
  color:var(--cr-muted);
}
.control-room-queue-lane-head strong{
  font-size:calc(15px * var(--v2-font-scale));
  font-weight:950;
  color:var(--cr-text);
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.control-room-tray.transfer-panel .control-room-transfer-label{
  padding:0 2px!important;
  color:var(--cr-muted)!important;
}
.control-room-tray.transfer-panel .control-room-transfer-list{
  max-height:none!important;
  height:auto!important;
  min-height:0!important;
  overflow:auto!important;
  padding:2px 4px 2px 0!important;
}
.control-room-tray.transfer-panel .control-room-transfer-choice{
  min-height:56px!important;
  border-radius:18px!important;
  padding:7px 10px!important;
  grid-template-columns:42px minmax(0,1fr) 24px!important;
}
.control-room-tray.transfer-panel .control-room-transfer-art{
  width:42px!important;
  height:42px!important;
  border-radius:14px!important;
}
.control-room-tray.transfer-panel .control-room-queue-preview{
  margin-top:0!important;
  min-height:0!important;
  height:100%!important;
  max-height:none!important;
  padding:12px!important;
  border-radius:22px!important;
}
.control-room-tray.transfer-panel .control-room-queue-row{
  min-height:46px!important;
  border-radius:15px!important;
}
.control-room-tray.transfer-panel .control-room-queue-actions{
  justify-content:center!important;
  gap:12px!important;
  padding:2px 2px 0!important;
}
.control-room-tray.transfer-panel .control-room-panel-action{
  min-width:150px;
}

@media (max-width:1100px){
  .control-room-action-console{grid-template-columns:minmax(0,1fr);align-items:stretch;}
  .control-room-media-controls{grid-template-columns:repeat(4,minmax(88px,1fr));}
}
@media (max-width:980px){
  .control-room-tray.transfer-panel{
    width:calc(100% - 24px)!important;
    max-height:calc(100dvh - 190px)!important;
  }
  .control-room-queue-lanes{grid-template-columns:minmax(0,1fr);}
  .control-room-queue-lane{grid-template-rows:auto minmax(110px,180px) auto minmax(118px,170px);}
  .control-room-media-controls{grid-template-columns:repeat(2,minmax(0,1fr));}
}
@media (max-width:640px){
  .control-room-action-console{padding:12px;border-radius:24px;}
  .control-room-action-art{width:58px;height:58px;border-radius:18px;}
  .control-room-action-name{font-size:calc(15px * var(--v2-font-scale));}
  .control-room-media-control{min-height:62px;border-radius:17px;}
  .control-room-tray.transfer-panel .control-room-panel-action{min-width:0;flex:1 1 calc(50% - 8px);}
}

.control-room-grid-wrap{
  grid-template-rows:auto minmax(0,1fr)!important;
  gap:10px!important;
}
.control-room-group-summary{
  width:100%;
  max-width:min(var(--control-room-grid-max-width, 100%), 100%);
  display:flex;
  gap:10px;
  overflow-x:auto;
  padding:0 2px 2px;
  scrollbar-width:none;
  box-sizing:border-box;
}
.card:not(.layout-tablet) .control-room-group-summary::-webkit-scrollbar{display:none;}
.control-room-group-chip{
  flex:0 0 auto;
  max-width:min(420px, 82vw);
  min-height:48px;
  display:flex;
  align-items:center;
  gap:10px;
  padding:7px 12px 7px 8px;
  border-radius:18px;
  border:1px solid rgba(var(--dynamic-accent-rgb,245 166 35) / .24);
  background:linear-gradient(145deg, rgba(var(--dynamic-accent-rgb,245 166 35) / .18), rgba(255,255,255,.06));
  color:var(--cr-text);
  box-shadow:0 14px 32px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.08);
}
.control-room-group-art{
  width:34px;
  height:34px;
  border-radius:12px;
  overflow:hidden;
  display:grid;
  place-items:center;
  flex:none;
  background:rgba(255,255,255,.08);
}
.control-room-group-art img{width:100%;height:100%;object-fit:cover;display:block;}
.control-room-group-art .ui-ic{width:17px;height:17px;color:var(--ma-accent);}
.control-room-group-copy{min-width:0;display:grid;gap:2px;}
.control-room-group-title{font-size:calc(11px * var(--v2-font-scale));font-weight:950;line-height:1.1;color:var(--cr-text);}
.control-room-group-members{font-size:calc(10px * var(--v2-font-scale));font-weight:760;color:var(--cr-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.control-room-library-shortcuts{
  display:flex;
  align-items:center;
  gap:8px;
  overflow-x:auto;
  padding-bottom:2px;
  scrollbar-width:none;
}
.card:not(.layout-tablet) .control-room-library-shortcuts::-webkit-scrollbar{display:none;}
.control-room-library-shortcuts button{
  min-height:42px;
  padding:0 13px;
  border-radius:999px;
  border:1px solid var(--cr-border)!important;
  background:var(--cr-panel-bg-soft)!important;
  color:var(--cr-text)!important;
  display:flex;
  align-items:center;
  gap:8px;
  font-size:calc(11px * var(--v2-font-scale));
  font-weight:920;
  white-space:nowrap;
  cursor:pointer;
}
.control-room-library-shortcuts .ui-ic{width:16px;height:16px;color:var(--ma-accent);}
.control-room-scene-save{
  display:grid;
  grid-template-columns:minmax(0,1fr) auto;
  gap:12px;
  align-items:center;
}
.control-room-scene-save .control-room-search{min-height:56px;}
.control-room-saved-scenes{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(250px,1fr));
  gap:10px;
  max-height:min(26dvh, 260px);
  overflow:auto;
  padding-inline-end:2px;
}
.control-room-saved-scene-card{
  min-width:0;
  display:grid;
  grid-template-columns:minmax(0,1fr) 48px;
  align-items:stretch;
  gap:8px;
}
.control-room-saved-scene-main,
.control-room-saved-scene-delete{
  border:1px solid var(--cr-border)!important;
  background:var(--cr-panel-bg-soft)!important;
  color:var(--cr-text)!important;
  box-shadow:0 14px 28px rgba(0,0,0,.14), inset 0 1px 0 rgba(255,255,255,.06);
  cursor:pointer;
}
.control-room-saved-scene-main{
  min-height:72px;
  border-radius:20px;
  display:grid;
  grid-template-columns:42px minmax(0,1fr);
  align-items:center;
  gap:12px;
  text-align:start;
  padding:10px 12px;
}
.control-room-saved-scene-main > .ui-ic{
  width:42px;
  height:42px;
  padding:11px;
  box-sizing:border-box;
  border-radius:15px;
  background:rgba(var(--dynamic-accent-rgb,245 166 35) / .16);
  color:var(--ma-accent);
}
.control-room-saved-scene-main span{display:grid;gap:4px;min-width:0;}
.control-room-saved-scene-main strong{font-size:calc(13px * var(--v2-font-scale));font-weight:950;color:var(--cr-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.control-room-saved-scene-main small{font-size:calc(10px * var(--v2-font-scale));font-weight:760;color:var(--cr-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.control-room-saved-scene-delete{
  width:48px;
  min-height:72px;
  border-radius:18px;
  display:grid;
  place-items:center;
  color:#ffc2c2!important;
  background:rgba(222,72,72,.14)!important;
  border-color:rgba(255,105,105,.24)!important;
}
.control-room-saved-scene-delete .ui-ic{width:18px;height:18px;}
.control-room-tray.transfer-panel{
  width:min(1180px, calc(100% - 72px))!important;
  max-height:min(calc(100% - var(--control-room-head-reserve, 74px) - 132px), 720px)!important;
  background:rgba(17,19,25,.985)!important;
}
.control-room-tray.transfer-panel .control-room-queue-layout{
  grid-template-rows:minmax(0,1fr) auto!important;
  min-height:0!important;
}
.control-room-queue-lane{
  grid-template-rows:auto minmax(110px,.48fr) auto minmax(132px,.52fr)!important;
}
.theme-light .control-room-group-chip,
.theme-light .control-room-saved-scene-main,
.theme-light .control-room-saved-scene-delete,
.theme-light .control-room-library-shortcuts button{
  background:rgba(255,255,255,.86)!important;
}
@media (max-width:980px){
  .control-room-scene-save{grid-template-columns:minmax(0,1fr);}
  .control-room-scene-save .control-room-panel-action{width:100%;}
  .control-room-saved-scenes{grid-template-columns:minmax(0,1fr);max-height:220px;}
  .control-room-group-summary{padding-inline:0;}
  .control-room-tray.transfer-panel{width:calc(100% - 24px)!important;}
}
.card.control-room-open .control-room-tray,
.card.control-room-open .control-room-tray.wide,
.card.control-room-open .control-room-tray.compact,
.card.control-room-open .control-room-announcement-tray,
.card.control-room-open .control-room-tray.transfer-panel{
  inset-inline-start:50%!important;
  inset-block-start:calc(var(--control-room-head-reserve, 74px) + 10px)!important;
  inset-block-end:calc(var(--control-room-dock-reserve, 116px) + 10px)!important;
  width:min(1320px, calc(100% - 28px))!important;
  height:auto!important;
  min-height:0!important;
  max-height:none!important;
  transform:translateX(-50%)!important;
}
.card.control-room-open .control-room-tray.compact,
.card.control-room-open .control-room-announcement-tray{
  width:min(980px, calc(100% - 28px))!important;
}
.card.control-room-open .control-room-tray.transfer-panel .control-room-transfer-list,
.card.control-room-open .control-room-tray.transfer-panel .control-room-queue-preview,
.card.control-room-open .control-room-picker-list,
.card.control-room-open .control-room-library-results{
  max-height:none!important;
}
@media (max-width:760px){
  .card.control-room-open .control-room-tray,
  .card.control-room-open .control-room-tray.wide,
  .card.control-room-open .control-room-tray.compact,
  .card.control-room-open .control-room-announcement-tray,
  .card.control-room-open .control-room-tray.transfer-panel{
    inset-block-start:calc(var(--control-room-head-reserve, 68px) + 8px)!important;
    inset-block-end:calc(var(--control-room-dock-reserve, 104px) + 8px)!important;
    width:calc(100% - 16px)!important;
    padding:14px!important;
    border-radius:24px!important;
  }
}

.card.performance-lite,
.card.performance-lite * ,
.card.performance-lite *::before,
.card.performance-lite *::after{
  animation:none!important;
  transition:none!important;
  scroll-behavior:auto!important;
  will-change:auto!important;
}
.card.performance-lite{
  box-shadow:none!important;
}
.card.performance-lite .bg{
  filter:none!important;
  transform:none!important;
  opacity:.72!important;
}
.card.performance-lite .shade{
  filter:none!important;
}
.card.performance-lite .glow,
.card.performance-lite .hero-aura,
.card.performance-lite .art-aura,
.card.performance-lite .compact-cover-echo,
.card.performance-lite .brand-light{
  display:none!important;
}
.card.performance-lite .menu-sheet,
.card.performance-lite .queue-action-sheet,
.card.performance-lite .history-drawer,
.card.performance-lite .control-room-backdrop,
.card.performance-lite .control-room-tray,
.card.performance-lite .control-room-dock,
.card.performance-lite .control-room-tile,
.card.performance-lite .player-menu-card,
.card.performance-lite .group-player-card,
.card.performance-lite .settings-group,
.card.performance-lite .menu-item,
.card.performance-lite .menu-list-item,
.card.performance-lite .queue-row,
.card.performance-lite .notice{
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
  box-shadow:none!important;
}
.card.performance-lite .queue-eq span,
.card.performance-lite .eq-icon span{
  animation:none!important;
  transform:none!important;
}
.card.performance-ultra-lite .np-sub.scroll-when-overflow.is-overflowing .scrolling-text-inner{
  animation:none!important;
  transform:none!important;
  will-change:auto!important;
}
.performance-profile-pills .settings-pill{
  flex:1 1 96px;
}
.card.performance-ultra-lite .menu-sheet,
.card.performance-ultra-lite .queue-action-sheet,
.card.performance-ultra-lite .history-drawer,
.card.performance-ultra-lite .control-room-backdrop,
.card.performance-ultra-lite .control-room-tray,
.card.performance-ultra-lite .control-room-dock{
  background:rgba(11,14,20,.98)!important;
  border-color:rgba(255,255,255,.11)!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
  box-shadow:none!important;
}
.theme-light.card.performance-ultra-lite .menu-sheet,
.theme-light.card.performance-ultra-lite .queue-action-sheet,
.theme-light.card.performance-ultra-lite .history-drawer,
.theme-light.card.performance-ultra-lite .control-room-backdrop,
.theme-light.card.performance-ultra-lite .control-room-tray,
.theme-light.card.performance-ultra-lite .control-room-dock{
  background:rgba(248,250,253,.98)!important;
  border-color:rgba(123,139,164,.22)!important;
  box-shadow:none!important;
}
.card.performance-ultra-lite .menu-sheet::before,
.card.performance-ultra-lite .menu-sheet::after,
.card.performance-ultra-lite .queue-action-sheet::before,
.card.performance-ultra-lite .queue-action-sheet::after,
.card.performance-ultra-lite .history-drawer::before,
.card.performance-ultra-lite .history-drawer::after,
.card.performance-ultra-lite .control-room-backdrop::before,
.card.performance-ultra-lite .control-room-backdrop::after,
.card.performance-ultra-lite .control-room-tray::before,
.card.performance-ultra-lite .control-room-tray::after,
.card.performance-ultra-lite .control-room-dock::before,
.card.performance-ultra-lite .control-room-dock::after{
  display:none!important;
  content:none!important;
}
.card.performance-ultra-lite .menu-item,
.card.performance-ultra-lite .menu-list-item,
.card.performance-ultra-lite .queue-row,
.card.performance-ultra-lite .media-entry.grid,
.card.performance-ultra-lite .player-menu-card,
.card.performance-ultra-lite .group-player-card,
.card.performance-ultra-lite .settings-group,
.card.performance-ultra-lite .control-room-tile,
.card.performance-ultra-lite .notice{
  background:rgba(20,24,32,.96)!important;
  border-color:rgba(255,255,255,.11)!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
  box-shadow:none!important;
}
.theme-light.card.performance-ultra-lite .menu-item,
.theme-light.card.performance-ultra-lite .menu-list-item,
.theme-light.card.performance-ultra-lite .queue-row,
.theme-light.card.performance-ultra-lite .media-entry.grid,
.theme-light.card.performance-ultra-lite .player-menu-card,
.theme-light.card.performance-ultra-lite .group-player-card,
.theme-light.card.performance-ultra-lite .settings-group,
.theme-light.card.performance-ultra-lite .control-room-tile,
.theme-light.card.performance-ultra-lite .notice{
  background:rgba(255,255,255,.96)!important;
  border-color:rgba(123,139,164,.2)!important;
}
.card.performance-ultra-lite.screensaver-active .bg,
.card.performance-ultra-lite.screensaver-active .shade,
.card.performance-ultra-lite.screensaver-active .glow,
.card.performance-ultra-lite .screensaver-backdrop.empty-mode::before,
.card.performance-ultra-lite .screensaver-backdrop.empty-mode::after{
  display:none!important;
}
.card.performance-ultra-lite .screensaver-backdrop{
  background:#02060d!important;
}
.theme-light.card.performance-ultra-lite .screensaver-backdrop{
  background:#f8fafc!important;
}
.card.performance-ultra-lite .screensaver-bg{
  filter:none!important;
  transform:none!important;
  opacity:.18!important;
  background:
    linear-gradient(180deg, rgba(3,7,13,.78), rgba(3,7,13,.94)),
    var(--screensaver-art-url, none) center/cover no-repeat!important;
}
.card.performance-ultra-lite .screensaver-backdrop.empty-mode .screensaver-bg{
  display:none!important;
}
.card.performance-ultra-lite .screensaver-brand{
  display:none!important;
}
.card.performance-ultra-lite .screensaver-art,
.card.performance-ultra-lite .screensaver-analog-clock,
.card.performance-ultra-lite .screensaver-message,
.card.performance-ultra-lite .screensaver-voice-btn{
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
  box-shadow:none!important;
}
.card.performance-ultra-lite .screensaver-art{
  border-color:rgba(255,255,255,.12)!important;
}
.card.performance-ultra-lite .screensaver-info,
.card.performance-ultra-lite .screensaver-next{
  text-shadow:none!important;
}
.card.performance-ultra-lite .screensaver-empty-logo{
  filter:none!important;
  opacity:.68!important;
}
.card.performance-ultra-lite .screensaver-voice-btn{
  background:rgba(18,22,30,.96)!important;
  opacity:.62!important;
}
.card.performance-ultra-lite .screensaver-voice-btn.listening::after{
  display:none!important;
}

.menu-sheet,
.queue-action-sheet,
.history-drawer{
  background:
    radial-gradient(circle at 16% 4%, rgba(var(--dynamic-accent-rgb,245 166 35) / .22), transparent 34%),
    radial-gradient(circle at 86% 18%, rgba(96,165,250,.12), transparent 34%),
    linear-gradient(180deg, rgba(25,28,36,.92), rgba(11,14,20,.94))!important;
  border-color:rgba(255,255,255,.13)!important;
}
`;
}
