// discovery styles. Order is preserved by card-styles.js.
export default function() {
  return `.theme-light.card.layout-tablet .menu-backdrop.library-fullscreen-open .menu-sheet.sheet-library::after,
.theme-light.card.layout-tablet .menu-backdrop.library-fullscreen-open .menu-sheet.sheet-search::after,
.theme-light.card.layout-tablet .menu-backdrop.library-fullscreen-open .menu-sheet.sheet-artist-detail::after{
  background:
    radial-gradient(circle at 14% 12%, rgba(var(--dynamic-accent-rgb,245 166 35) / .18), transparent 34%),
    radial-gradient(circle at 84% 4%, rgba(80,127,220,.14), transparent 28%),
    linear-gradient(180deg, rgba(248,250,253,.80), rgba(234,240,248,.98))!important;
}
.card.layout-tablet .menu-backdrop.library-fullscreen-open .menu-body.sheet-library,
.card.layout-tablet .menu-backdrop.library-fullscreen-open .menu-body.sheet-search,
.card.layout-tablet .menu-backdrop.library-fullscreen-open .menu-body.sheet-artist-detail{
  overflow:auto!important;
  justify-items:stretch!important;
  align-content:start!important;
  padding:clamp(10px, 2vw, 24px) clamp(18px, 3vw, 46px) 36px!important;
}

.menu-backdrop.discovery-open{
  padding:0!important;
  background:rgba(5,7,12,.72)!important;
  z-index:80!important;
}
.card:has(.menu-backdrop.discovery-open.open) > .home-shortcut-fab{
  display:none!important;
}
.menu-backdrop.discovery-open::before{
  opacity:.72!important;
  filter:blur(46px) saturate(1.24) brightness(.78)!important;
}
.menu-backdrop.discovery-open .menu-sheet.sheet-discovery{
  width:100%!important;
  max-width:100%!important;
  height:100%!important;
  max-height:100%!important;
  margin:0!important;
  border-radius:0!important;
  box-shadow:none!important;
}
.menu-backdrop.discovery-open .menu-head{
  min-height:62px;
  background:rgba(8,10,16,.54);
  border-bottom-color:rgba(255,255,255,.10);
  backdrop-filter:blur(18px);
}
.menu-backdrop.discovery-open .menu-title{
  max-width:min(620px, calc(100% - 132px));
}
.menu-backdrop.discovery-open .menu-title-text{
  display:inline-block;
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.menu-backdrop.discovery-open .menu-sheet.sheet-discovery::after{
  background:
    radial-gradient(circle at 14% 12%, rgba(var(--dynamic-accent-rgb,245 166 35) / .18), transparent 34%),
    radial-gradient(circle at 84% 4%, rgba(91,141,255,.16), transparent 28%),
    linear-gradient(180deg, rgba(7,9,15,.68), rgba(8,10,16,.96))!important;
}
.theme-light .menu-backdrop.discovery-open .menu-sheet.sheet-discovery::after{
  background:
    radial-gradient(circle at 14% 12%, rgba(var(--dynamic-accent-rgb,245 166 35) / .18), transparent 34%),
    radial-gradient(circle at 84% 4%, rgba(80,127,220,.14), transparent 28%),
    linear-gradient(180deg, rgba(248,250,253,.80), rgba(234,240,248,.98))!important;
}
.menu-body.sheet-discovery{
  overflow:auto!important;
  justify-items:stretch!important;
  align-content:start!important;
  padding:clamp(2px, .8vw, 10px) clamp(14px, 3vw, 42px) 36px!important;
}
.discovery-shell{
  width:100%;
  min-height:100%;
  display:grid;
  gap:clamp(18px, 3vw, 34px);
  align-content:start;
}
.discovery-hero{
  min-height:clamp(96px, 14vh, 148px);
  display:grid;
  grid-template-columns:minmax(230px,.32fr) minmax(280px,1fr);
  align-items:center;
  gap:clamp(16px, 3vw, 38px);
  padding:clamp(8px, 1.4vw, 18px) 2px 0;
}
.discovery-hero-copy{
  max-width:680px;
  min-width:0;
  display:grid;
  gap:6px;
}
.discovery-hero-title{
  max-width:min(100%, 540px);
  font-size:clamp(34px, 5vw, 72px);
  line-height:.98;
  font-weight:950;
  overflow-wrap:anywhere;
}
.discovery-hero-sub{
  max-width:min(100%, 460px);
  color:var(--ma-text-2);
  font-size:13px;
  line-height:1.4;
  font-weight:850;
  overflow-wrap:anywhere;
}
.discovery-filter-panel{
  min-width:0;
  align-self:center;
  max-width:min(820px, 100%);
  justify-self:stretch;
  display:grid;
  gap:10px;
}
.card.layout-tablet .discovery-filter-panel{
  grid-template-columns:minmax(260px, 360px) minmax(320px, 1fr);
  align-items:end;
  gap:16px;
}
.card.layout-tablet .discovery-player-focus{
  width:100%;
  max-width:none;
  align-self:end;
}
.card.layout-tablet .discovery-category-select{
  align-self:end;
}
.discovery-player-focus{
  min-width:0;
  max-width:min(100%, 430px);
  justify-self:start;
  min-height:58px;
  display:grid;
  grid-template-columns:auto 42px minmax(0,1fr) auto;
  align-items:center;
  gap:10px;
  border:1px solid rgba(255,255,255,.14);
  border-radius:18px;
  padding:8px 12px;
  color:var(--ma-text-1);
  background:linear-gradient(145deg, rgba(255,255,255,.11), rgba(255,255,255,.045));
  box-shadow:0 16px 34px rgba(0,0,0,.15), inset 0 1px 0 rgba(255,255,255,.1);
  cursor:pointer;
  text-align:start;
}
.discovery-player-focus:hover,
.discovery-player-focus:focus-visible{
  transform:translateY(-1px);
  border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .34);
}
.discovery-player-kicker{
  font-size:11px;
  font-weight:950;
  color:var(--ma-accent);
  white-space:nowrap;
}
.discovery-player-art{
  width:42px;
  height:42px;
  border-radius:13px;
  overflow:hidden;
  display:grid;
  place-items:center;
  background:rgba(255,255,255,.08);
}
.discovery-player-art img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
}
.discovery-player-art .ui-ic{
  width:21px;
  height:21px;
}
.discovery-player-copy{
  min-width:0;
  display:grid;
  gap:2px;
}
.discovery-player-name,
.discovery-player-state{
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.discovery-player-name{
  font-size:14px;
  font-weight:950;
}
.discovery-player-state{
  font-size:12px;
  font-weight:760;
  color:var(--ma-text-2);
}
.theme-light .discovery-player-focus{
  background:rgba(255,255,255,.78);
  border-color:rgba(137,154,178,.22);
  box-shadow:0 16px 30px rgba(105,122,148,.14);
}
.discovery-filter-rail{
  display:flex;
  align-items:center;
  gap:10px;
  min-width:0;
  overflow:auto;
  padding:2px 2px 10px;
  scrollbar-width:none;
  mask-image:linear-gradient(90deg, transparent, #000 18px, #000 calc(100% - 18px), transparent);
}
.discovery-filter-rail::-webkit-scrollbar{display:none;}
.discovery-filter-divider{
  flex:0 0 1px;
  align-self:stretch;
  min-height:38px;
  background:rgba(255,255,255,.14);
  margin-inline:2px;
}
.discovery-filter-chip{
  flex:0 0 auto;
  min-height:48px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:9px;
  border:1px solid rgba(255,255,255,.13);
  border-radius:999px;
  background:linear-gradient(145deg, rgba(255,255,255,.105), rgba(255,255,255,.045));
  color:var(--ma-text-2);
  padding:9px 16px;
  font:inherit;
  font-size:13px;
  font-weight:930;
  white-space:nowrap;
  cursor:pointer;
  box-shadow:0 14px 30px rgba(0,0,0,.14), inset 0 1px 0 rgba(255,255,255,.10);
  transition:transform .18s ease, border-color .18s ease, color .18s ease, background .18s ease, box-shadow .18s ease;
}
.discovery-filter-chip:hover,
.discovery-filter-chip:focus-visible,
.discovery-filter-chip.active{
  transform:translateY(-2px);
  color:var(--ma-text-1);
  border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .34);
  background:linear-gradient(145deg, rgba(var(--dynamic-accent-rgb,245 166 35) / .20), rgba(255,255,255,.07));
  box-shadow:0 20px 42px rgba(0,0,0,.20), inset 0 1px 0 rgba(255,255,255,.14);
}
.discovery-filter-chip-genre.active{
  color:var(--ma-accent);
}
.discovery-filter-dot{
  width:7px;
  height:7px;
  border-radius:999px;
  background:currentColor;
  box-shadow:0 0 14px currentColor;
  flex:0 0 auto;
}
.discovery-filter-icon{
  width:24px;
  height:24px;
  border-radius:999px;
  display:grid;
  place-items:center;
  color:var(--ma-accent);
  background:rgba(var(--dynamic-accent-rgb,245 166 35) / .14);
}
.discovery-filter-icon .ui-ic{width:15px;height:15px;}
.theme-light .discovery-filter-chip{
  background:rgba(255,255,255,.72);
  border-color:rgba(15,23,42,.10);
  box-shadow:0 12px 26px rgba(15,23,42,.08), inset 0 1px 0 rgba(255,255,255,.74);
}
.theme-light .discovery-filter-divider{
  background:rgba(15,23,42,.12);
}
.discovery-subgenre-rail{
  display:flex;
  align-items:center;
  gap:8px;
  min-width:0;
  overflow:auto;
  padding:0 2px 8px;
  scrollbar-width:none;
  mask-image:linear-gradient(90deg, transparent, #000 18px, #000 calc(100% - 18px), transparent);
}
.discovery-subgenre-rail::-webkit-scrollbar{display:none;}
.discovery-subgenre-chip{
  flex:0 0 auto;
  min-height:34px;
  border:1px solid rgba(255,255,255,.11);
  border-radius:999px;
  background:rgba(255,255,255,.055);
  color:var(--ma-text-3);
  padding:7px 12px;
  font:inherit;
  font-size:12px;
  font-weight:850;
  white-space:nowrap;
  cursor:pointer;
  transition:transform .16s ease, border-color .16s ease, color .16s ease, background .16s ease;
}
.discovery-subgenre-chip:hover,
.discovery-subgenre-chip:focus-visible,
.discovery-subgenre-chip.active{
  transform:translateY(-1px);
  color:var(--ma-text-1);
  border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .30);
  background:rgba(var(--dynamic-accent-rgb,245 166 35) / .14);
}
.theme-light .discovery-subgenre-chip{
  background:rgba(255,255,255,.62);
  border-color:rgba(15,23,42,.10);
}
.discovery-filter-panel{
  min-width:0;
  align-self:center;
  display:grid;
  gap:8px;
  max-width:min(820px, 100%);
  justify-self:stretch;
}
.discovery-category-select{
  display:grid;
  gap:7px;
  min-width:0;
}
.discovery-category-select span{
  color:var(--ma-text-2);
  font-size:10px;
  font-weight:950;
  text-transform:uppercase;
}
.discovery-category-select select{
  min-height:46px;
  width:100%;
}
.discovery-selector{
  display:grid;
  gap:8px;
  min-width:0;
}
.discovery-selector-label{
  width:fit-content;
  max-width:100%;
  padding:5px 10px;
  border-radius:999px;
  color:var(--ma-text-2);
  background:rgba(255,255,255,.07);
  border:1px solid rgba(255,255,255,.10);
  font-size:10px;
  font-weight:950;
  text-transform:uppercase;
}
.discovery-category-strip{
  display:flex;
  gap:10px;
  overflow:auto;
  padding:3px 2px 8px;
  scrollbar-width:none;
  mask-image:linear-gradient(90deg, transparent, #000 18px, #000 calc(100% - 18px), transparent);
}
.discovery-category-strip::-webkit-scrollbar{display:none;}
.discovery-category-chip{
  flex:0 0 auto;
  min-width:136px;
  min-height:56px;
  display:grid;
  grid-template-columns:34px minmax(0,1fr);
  align-items:center;
  gap:9px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.14);
  background:linear-gradient(145deg, rgba(255,255,255,.11), rgba(255,255,255,.045));
  color:var(--ma-text-1);
  padding:8px 13px 8px 9px;
  font:inherit;
  text-align:start;
  cursor:pointer;
  box-shadow:0 16px 34px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.12);
  transition:transform .18s ease, border-color .18s ease, background .18s ease, box-shadow .18s ease;
}
.discovery-category-chip.active,
.discovery-category-chip:hover,
.discovery-category-chip:focus-visible{
  transform:translateY(-2px);
  border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .38);
  background:linear-gradient(145deg, rgba(var(--dynamic-accent-rgb,245 166 35) / .22), rgba(255,255,255,.075));
  box-shadow:0 20px 42px rgba(0,0,0,.20), inset 0 1px 0 rgba(255,255,255,.14);
}
.discovery-category-icon{
  width:34px;
  height:34px;
  border-radius:999px;
  display:grid;
  place-items:center;
  color:var(--ma-accent);
  background:rgba(var(--dynamic-accent-rgb,245 166 35) / .14);
}
.discovery-category-icon .ui-ic{width:18px;height:18px;}
.discovery-category-copy{
  min-width:0;
  display:grid;
  gap:2px;
}
.discovery-category-title,
.discovery-category-sub{
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.discovery-category-title{
  font-size:13px;
  font-weight:950;
}
.discovery-category-sub{
  color:var(--ma-text-3);
  font-size:10px;
  font-weight:760;
}
.discovery-genre-strip{
  display:flex;
  gap:9px;
  overflow:auto;
  padding:2px 2px 8px;
  scrollbar-width:none;
  mask-image:linear-gradient(90deg, transparent, #000 18px, #000 calc(100% - 18px), transparent);
}
.discovery-genre-strip::-webkit-scrollbar{display:none;}
.discovery-genre-chip{
  flex:0 0 auto;
  min-height:40px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  border:1px solid rgba(255,255,255,.12);
  border-radius:999px;
  background:rgba(255,255,255,.06);
  color:var(--ma-text-2);
  padding:8px 14px;
  font:inherit;
  font-size:12px;
  font-weight:900;
  cursor:pointer;
  box-shadow:0 12px 28px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.08);
  transition:transform .18s ease, border-color .18s ease, color .18s ease, background .18s ease;
}
.discovery-genre-chip::before{
  content:"";
  width:7px;
  height:7px;
  border-radius:999px;
  background:currentColor;
  box-shadow:0 0 14px currentColor;
}
.discovery-genre-chip.active,
.discovery-genre-chip:hover,
.discovery-genre-chip:focus-visible{
  transform:translateY(-2px);
  color:var(--ma-accent);
  border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .34);
  background:rgba(var(--dynamic-accent-rgb,245 166 35) / .13);
}
.theme-light .discovery-category-chip{
  background:rgba(255,255,255,.74);
  border-color:rgba(15,23,42,.10);
  box-shadow:0 14px 34px rgba(15,23,42,.10), inset 0 1px 0 rgba(255,255,255,.82);
}
.theme-light .discovery-category-chip.active,
.theme-light .discovery-category-chip:hover,
.theme-light .discovery-category-chip:focus-visible{
  background:rgba(var(--dynamic-accent-rgb,245 166 35) / .14);
  border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .26);
}
.theme-light .discovery-selector-label,
.theme-light .discovery-genre-chip{
  background:rgba(255,255,255,.70);
  border-color:rgba(15,23,42,.10);
  box-shadow:0 12px 26px rgba(15,23,42,.08), inset 0 1px 0 rgba(255,255,255,.74);
}
.discovery-endless{
  display:grid;
  gap:0;
}
.discovery-endless-head{
  display:none;
  align-items:end;
  justify-content:space-between;
  gap:12px;
  padding-inline:2px;
}
.discovery-endless-title{
  font-size:16px;
  font-weight:950;
  color:var(--ma-text-1);
}
.discovery-endless-sub{
  color:var(--ma-text-3);
  font-size:12px;
  font-weight:760;
}
.discovery-orb-field{
  position:relative;
  display:grid;
  grid-template-columns:repeat(auto-fit, minmax(154px, 1fr));
  gap:clamp(48px, 6vw, 72px) clamp(22px, 4vw, 56px);
  align-items:start;
  padding:clamp(6px, 1.4vw, 18px) clamp(4px, 1vw, 14px) 110px;
  isolation:isolate;
}
.discovery-orb-field::before{
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  z-index:-1;
  opacity:.46;
  background:
    radial-gradient(circle at 14% 22%, rgba(var(--dynamic-accent-rgb,245 166 35) / .18), transparent 18%),
    radial-gradient(circle at 72% 46%, rgba(118,168,255,.12), transparent 22%),
    radial-gradient(circle at 46% 88%, rgba(255,255,255,.08), transparent 16%);
  filter:blur(2px);
}
.discovery-orb{
  --orb-size:156px;
  --orb-shift:0px;
  --orb-lift:0px;
  --orb-delay:0s;
  width:var(--orb-size);
  justify-self:center;
  margin-block-start:var(--orb-lift);
  display:grid;
  gap:12px;
  border:0;
  background:transparent;
  color:var(--ma-text-3);
  padding:0;
  text-align:center;
  font:inherit;
  cursor:pointer;
  transform:translateX(var(--orb-shift));
  transition:transform .22s ease, color .22s ease;
  position:relative;
  z-index:1;
  isolation:isolate;
}
.discovery-orb::before{
  content:none;
}
.rtl .discovery-orb{
  transform:translateX(calc(var(--orb-shift) * -1));
}
.discovery-orb.is-active{
  color:var(--ma-text-1);
  z-index:8;
}
.discovery-orb-field.has-active .discovery-orb:not(.is-active){
  z-index:0;
}
.discovery-orb-field.has-active .discovery-orb:not(.is-active) .discovery-orb-art{
  opacity:.7;
  filter:blur(.45px) saturate(.76) brightness(.82);
}
.discovery-orb-field.has-active .discovery-orb:not(.is-active) .discovery-orb-copy{
  opacity:.66;
}
.discovery-orb-art{
  position:relative;
  width:var(--orb-size);
  height:var(--orb-size);
  scale:1;
  border-radius:999px;
  display:grid;
  place-items:center;
  overflow:hidden;
  background:
    radial-gradient(circle at 28% 22%, rgba(255,255,255,.34), transparent 15%),
    radial-gradient(circle at 64% 74%, rgba(255,255,255,.10), transparent 35%),
    rgba(255,255,255,.09);
  border:1px solid rgba(255,255,255,.14);
  box-shadow:0 24px 48px rgba(0,0,0,.26), inset 0 1px 0 rgba(255,255,255,.18);
  animation:discoveryOrbBreath 7.5s ease-in-out infinite;
  animation-delay:var(--orb-delay);
  transition:transform .24s ease, box-shadow .24s ease, border-color .24s ease, filter .24s ease;
  will-change:scale, opacity;
}
.discovery-orb-art::after{
  content:"";
  position:absolute;
  inset:0;
  border-radius:inherit;
  pointer-events:none;
  background:
    radial-gradient(circle at 28% 18%, rgba(255,255,255,.50), transparent 11%),
    linear-gradient(145deg, rgba(255,255,255,.22), transparent 38%, rgba(0,0,0,.16));
  mix-blend-mode:screen;
  opacity:.46;
}
.discovery-orb:hover .discovery-orb-art,
.discovery-orb:focus-visible .discovery-orb-art{
  transform:translateY(-3px) scale(1.04);
  box-shadow:0 24px 48px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.18);
}
.discovery-orb.is-active .discovery-orb-art{
  animation:none;
  translate:0 0;
  scale:1;
  transform:translateY(-8px) scale(1.24);
  border-color:rgba(255,255,255,.10);
  box-shadow:0 34px 76px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.18);
  filter:saturate(1.08) contrast(1.03);
}
.discovery-orb-art img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
}
.discovery-orb-play{
  position:absolute;
  inset:0;
  display:grid;
  place-items:center;
  opacity:0;
  color:rgba(255,255,255,.88);
  background:radial-gradient(circle, rgba(0,0,0,.22), rgba(0,0,0,.02) 58%, transparent 72%);
  transition:opacity .22s ease;
}
.discovery-orb-play::before{
  content:"";
  position:absolute;
  width:74px;
  height:74px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.34);
  opacity:0;
  transform:scale(.62);
}
.discovery-orb-play .ui-ic{
  width:42px;
  height:42px;
  filter:drop-shadow(0 8px 20px rgba(0,0,0,.36));
  transition:transform .18s ease, filter .18s ease;
}
.discovery-orb.is-active .discovery-orb-play{
  opacity:.82;
}
.discovery-orb.is-launching .discovery-orb-art{
  filter:saturate(1.14) contrast(1.06) brightness(1.08);
}
.discovery-orb.is-launching .discovery-orb-play{
  opacity:1;
}
.discovery-orb.is-launching .discovery-orb-play::before{
  animation:discoveryPlayConfirm .42s ease-out;
}
.discovery-orb.is-launching .discovery-orb-play .ui-ic{
  transform:scale(1.18);
  filter:drop-shadow(0 10px 24px rgba(0,0,0,.44));
}
.discovery-orb.library-action-feedback .discovery-orb-art{
  transform:translateY(-3px) scale(1.07);
  border-color:color-mix(in srgb, var(--ma-accent) 28%, rgba(255,255,255,.12));
  box-shadow:0 26px 56px rgba(0,0,0,.3), 0 0 30px color-mix(in srgb, var(--ma-accent) 18%, transparent), inset 0 1px 0 rgba(255,255,255,.18);
}
.discovery-orb.is-active.library-action-feedback .discovery-orb-art{
  transform:translateY(-8px) scale(1.27);
}
.discovery-orb.library-action-loading .discovery-orb-play{
  opacity:1;
}
.discovery-orb.library-action-loading .discovery-orb-play::before{
  opacity:.96;
  transform:scale(.78);
  border-color:rgba(255,255,255,.34);
  border-inline-end-color:var(--ma-accent);
  animation:homeiiLoadingSpin .74s linear infinite;
}
.discovery-orb.library-action-loading .discovery-orb-play .ui-ic{
  opacity:.42;
  transform:scale(.94);
}
.discovery-orb-copy{
  display:grid;
  gap:3px;
  min-width:0;
  padding:0 4px;
  transition:transform .24s ease, opacity .24s ease, background .24s ease, border-color .24s ease, padding .24s ease, box-shadow .24s ease;
}
.discovery-orb-title,
.discovery-orb-sub{
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.discovery-orb-title{
  font-size:13px;
  font-weight:950;
  color:rgba(255,255,255,.54);
}
.discovery-orb-sub{
  color:rgba(255,255,255,.38);
  font-size:11px;
  font-weight:700;
  opacity:0;
  max-height:0;
  transition:opacity .2s ease, max-height .2s ease, color .2s ease;
}
.discovery-orb.is-active .discovery-orb-copy{
  transform:translateY(10px);
  padding:8px 2px 0;
  border-radius:0;
  background:transparent;
  border:0;
  box-shadow:none;
  backdrop-filter:none;
}
.discovery-orb.is-active .discovery-orb-title{
  color:var(--ma-text-1);
  font-size:14px;
}
.discovery-orb.is-active .discovery-orb-sub{
  color:var(--ma-text-2);
  opacity:1;
  max-height:34px;
}
.theme-light .discovery-orb-title{
  color:rgba(15,23,42,.58);
}
.theme-light .discovery-orb-sub{
  color:rgba(15,23,42,.42);
}
.theme-light .discovery-orb.is-active .discovery-orb-copy{
  background:transparent;
  box-shadow:none;
}
.theme-light .discovery-orb-field.has-active .discovery-orb:not(.is-active) .discovery-orb-art{
  filter:blur(.45px) saturate(.72) brightness(.92);
}
@keyframes discoveryOrbBreath{
  0%,100%{scale:.97;opacity:.88;}
  50%{scale:1.045;opacity:1;}
}
@keyframes discoveryPlayConfirm{
  0%{opacity:.72;transform:scale(.58);}
  100%{opacity:0;transform:scale(1.28);}
}
@media (prefers-reduced-motion: reduce){
  .discovery-orb-art{
    animation:none;
  }
  .discovery-orb.library-action-loading .discovery-orb-play::before{
    animation:none;
  }
}
@media (max-width: 760px){
  .menu-backdrop.discovery-open .menu-head{min-height:58px;}
  .discovery-hero{
    min-height:auto;
    grid-template-columns:1fr;
    align-items:start;
    padding:2px 2px 0;
  }
  .discovery-hero-title{font-size:clamp(32px, 10vw, 44px);}
  .discovery-player-focus{
    width:100%;
    max-width:none;
    grid-template-columns:36px minmax(0,1fr) auto;
  }
  .discovery-player-kicker{
    grid-column:1 / -1;
    font-size:10px;
  }
  .discovery-player-art{
    width:36px;
    height:36px;
    border-radius:11px;
  }
  .discovery-filter-rail{padding-block-start:0;}
  .discovery-category-chip{min-width:128px;}
  .discovery-orb-field{
    grid-template-columns:repeat(2, minmax(0, 1fr));
    gap:32px 10px;
    padding-bottom:70px;
  }
  .discovery-orb,
  .rtl .discovery-orb{
    --orb-size:clamp(98px, 29vw, 126px);
    margin-block-start:0;
    transform:none;
  }
  .discovery-orb.is-active .discovery-orb-art{
    transform:translateY(-4px) scale(1.08);
  }
}
@media (max-width: 420px), (max-height: 560px) and (max-width: 900px){
  .menu-body.sheet-discovery{
    padding-inline:10px!important;
  }
  .discovery-shell{
    gap:16px;
  }
  .discovery-orb-field{
    grid-template-columns:repeat(2, minmax(0, 1fr))!important;
    gap:26px 8px!important;
    padding-inline:0!important;
  }
  .discovery-orb,
  .rtl .discovery-orb{
    --orb-size:clamp(86px, 26vw, 112px)!important;
    width:min(var(--orb-size), 100%)!important;
    transform:none!important;
  }
  .discovery-orb-copy{
    padding-inline:1px!important;
  }
  .discovery-orb.is-active .discovery-orb-art{
    transform:translateY(-3px) scale(1.06)!important;
  }
}
.power-fab{
  color:#ffd9d9!important;
  background:linear-gradient(145deg, rgba(255,85,95,.22), rgba(255,85,95,.1))!important;
  border-color:rgba(255,105,115,.24)!important;
}
.danger-fab{
  color:#ffd9d9!important;
  background:linear-gradient(145deg, rgba(255,85,95,.22), rgba(255,85,95,.1))!important;
  border-color:rgba(255,105,115,.24)!important;
}
.theme-light .power-fab{
  color:#b4232b!important;
  background:#fff1f2!important;
  border-color:rgba(180,35,43,.16)!important;
}
.theme-light .danger-fab{
  color:#b4232b!important;
  background:#fff1f2!important;
  border-color:rgba(180,35,43,.16)!important;
}
.card.screensaver-active .stage{
  pointer-events:none;
}
.card.screensaver-active .bg,
.card.screensaver-active .shade,
.card.screensaver-active .glow{
  animation-play-state:paused;
}

.screensaver-backdrop{
  position:absolute;
  inset:0;
  z-index:85;
  display:grid;
  place-items:center;
  padding:28px;
  background:#02060d;
  opacity:0;
  pointer-events:none;
  transition:opacity .46s cubic-bezier(.22,.78,.24,1);
  overflow:hidden;
  isolation:isolate;
  contain:layout paint style;
  will-change:opacity;
  transform:translateZ(0);
}
`;
}
