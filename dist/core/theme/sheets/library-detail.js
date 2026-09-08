// library-detail styles. Order is preserved by card-styles.js.
export default function() {
  return `.theme-light .screensaver-backdrop.empty-mode{
  background:
    radial-gradient(circle at 18% 14%, rgba(var(--dynamic-accent-rgb,245 166 35) / .16), transparent 34%),
    radial-gradient(circle at 82% 22%, rgba(80,127,220,.14), transparent 30%),
    linear-gradient(135deg, #f4f7fb, #e7edf6 52%, #f8fafc);
}
.theme-light .screensaver-backdrop.empty-mode .screensaver-bg{
  background:
    radial-gradient(circle at 18% 24%, rgba(var(--dynamic-accent-rgb,245 166 35) / .24), transparent 30%),
    radial-gradient(circle at 72% 38%, rgba(80,127,220,.18), transparent 34%),
    radial-gradient(circle at 48% 78%, rgba(25,34,48,.08), transparent 28%),
    linear-gradient(135deg, #f8fafc, #e7edf6);
}
.theme-light .screensaver-empty-logo{
  color:rgba(20,26,38,.52);
  filter:drop-shadow(0 18px 34px rgba(255,255,255,.24));
}
#mobileMenu{
  --detail-accent-rgb:var(--dynamic-accent-rgb,245 166 35);
  --detail-surface-rgb:var(--dynamic-surface-rgb,24 30 44);
  --detail-glow-rgb:var(--dynamic-glow-rgb,96 165 250);
}
#mobileMenu .menu-head{
  grid-template-columns:52px minmax(0,1fr) 52px;
}
.card.layout-tablet #mobileMenu .menu-head{
  grid-template-columns:48px minmax(0,1fr) 48px;
}
#mobileMenuBackBtn{
  grid-column:1;
  grid-row:1;
  justify-self:start;
}
#mobileMenuTitle{
  grid-column:2;
  grid-row:1;
}
#mobileMenuCloseBtn{
  grid-column:3;
  grid-row:1;
  justify-self:end;
}
#mobileMenuAuxBtn{
  position:absolute;
  inset-block-start:18px;
  inset-inline-end:68px;
}
#mobileMenuAuxBtn[hidden]{
  display:none!important;
}
#mobileMenu.has-menu-detail-theme{
  --detail-accent-rgb:var(--menu-detail-accent-rgb, var(--dynamic-accent-rgb,245 166 35));
  --detail-surface-rgb:var(--menu-detail-surface-rgb, var(--dynamic-surface-rgb,24 30 44));
  --detail-glow-rgb:var(--menu-detail-glow-rgb, var(--dynamic-glow-rgb,96 165 250));
}
#mobileMenu.has-menu-detail-theme::before{
  opacity:.68;
  filter:blur(46px) saturate(1.18) brightness(.82);
}
#mobileMenu.has-menu-detail-theme .menu-sheet.sheet-media-detail,
#mobileMenu.has-menu-detail-theme .menu-sheet.sheet-artist-detail,
#mobileMenu.has-menu-detail-theme .menu-sheet.sheet-library{
  background:
    radial-gradient(circle at 18% 0%, rgba(var(--detail-accent-rgb) / .26), transparent 36%),
    radial-gradient(circle at 86% 18%, rgba(var(--detail-glow-rgb) / .18), transparent 34%),
    linear-gradient(180deg, rgba(var(--detail-surface-rgb) / .24), rgba(10,12,18,.96))!important;
  border-color:rgba(var(--detail-accent-rgb) / .24)!important;
}
#mobileMenu.has-menu-detail-theme .menu-sheet.sheet-media-detail::before,
#mobileMenu.has-menu-detail-theme .menu-sheet.sheet-artist-detail::before,
#mobileMenu.has-menu-detail-theme .menu-sheet.sheet-library::before{
  opacity:.3;
  filter:blur(34px) saturate(1.16) brightness(.78);
}
#mobileMenu.has-menu-detail-theme .menu-sheet.sheet-media-detail::after,
#mobileMenu.has-menu-detail-theme .menu-sheet.sheet-artist-detail::after,
#mobileMenu.has-menu-detail-theme .menu-sheet.sheet-library::after{
  background:
    linear-gradient(180deg, rgba(8,10,16,.66), rgba(10,12,19,.9) 46%, rgba(9,11,17,.96)),
    radial-gradient(circle at 22% 12%, rgba(var(--detail-accent-rgb) / .12), transparent 38%);
}
#mobileMenu.has-menu-detail-theme .menu-head{
  overflow:hidden;
  isolation:isolate;
  min-height:74px;
  background:
    linear-gradient(90deg, rgba(var(--detail-surface-rgb) / .34), rgba(11,13,20,.5)),
    radial-gradient(circle at 50% 0%, rgba(var(--detail-accent-rgb) / .18), transparent 46%);
  backdrop-filter:blur(18px);
  -webkit-backdrop-filter:blur(18px);
  border-bottom-color:rgba(var(--detail-accent-rgb) / .2);
}
#mobileMenu.has-menu-detail-theme .menu-head::before{
  content:"";
  position:absolute;
  inset:-30px;
  background:var(--menu-dynamic-art, none) center 34%/cover no-repeat;
  filter:blur(26px) saturate(1.16) brightness(.72);
  transform:scale(1.12);
  opacity:.36;
  z-index:0;
  pointer-events:none;
}
#mobileMenu.has-menu-detail-theme .menu-head::after{
  content:"";
  position:absolute;
  inset:0;
  background:
    linear-gradient(90deg, rgba(8,10,16,.78), rgba(10,12,18,.48) 48%, rgba(8,10,16,.78)),
    radial-gradient(circle at 50% 0%, rgba(var(--detail-accent-rgb) / .18), transparent 58%);
  z-index:0;
  pointer-events:none;
}
#mobileMenu.has-menu-detail-theme .menu-head>*{
  position:relative;
  z-index:1;
}
#mobileMenu.has-menu-detail-theme .menu-title-icon,
#mobileMenu.has-menu-detail-theme .media-detail-kicker,
#mobileMenu.has-menu-detail-theme .artist-year-title{
  color:rgb(var(--detail-accent-rgb));
  filter:drop-shadow(0 0 14px rgba(var(--detail-accent-rgb) / .18));
}
#mobileMenu .media-detail-hero,
#mobileMenu .artist-detail-hero{
  position:relative;
  overflow:hidden;
  isolation:isolate;
  border:1px solid rgba(var(--detail-accent-rgb) / .22)!important;
  background:
    linear-gradient(135deg, rgba(var(--detail-surface-rgb) / .34), rgba(255,255,255,.055)),
    radial-gradient(circle at 16% 18%, rgba(var(--detail-accent-rgb) / .16), transparent 42%)!important;
  box-shadow:0 22px 54px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.09)!important;
}
#mobileMenu .media-detail-hero::before,
#mobileMenu .artist-detail-hero::before{
  content:"";
  position:absolute;
  inset:-34px;
  background:var(--detail-hero-art, var(--menu-dynamic-art, none)) center/cover no-repeat;
  filter:blur(30px) saturate(1.18) brightness(.78);
  transform:scale(1.12);
  opacity:.42;
  pointer-events:none;
  z-index:0;
}
#mobileMenu .media-detail-hero::after,
#mobileMenu .artist-detail-hero::after{
  content:"";
  position:absolute;
  inset:0;
  background:
    linear-gradient(90deg, rgba(10,12,18,.78), rgba(16,19,29,.5) 58%, rgba(10,12,18,.76)),
    radial-gradient(circle at 18% 12%, rgba(var(--detail-accent-rgb) / .18), transparent 40%);
  pointer-events:none;
  z-index:0;
}
#mobileMenu .media-detail-hero>*,
#mobileMenu .artist-detail-hero>*{
  position:relative;
  z-index:1;
}
#mobileMenu .album-detail-player{
  grid-template-columns:minmax(136px, clamp(150px, 20cqi, 238px)) minmax(0,1fr);
  grid-template-areas:"art copy";
  align-items:center;
  gap:clamp(16px, 3cqi, 28px);
  min-height:clamp(178px, 25cqi, 270px);
  padding:clamp(16px, 2.6cqi, 26px);
}
#mobileMenu .media-detail-art-stage{
  grid-area:art;
  position:relative;
  width:100%;
  max-width:238px;
  aspect-ratio:1/1;
  display:grid;
  place-items:center;
  justify-self:center;
  border-radius:26px;
}
#mobileMenu .media-detail-art{
  width:100%;
  height:100%;
  border-radius:26px;
  box-shadow:0 24px 58px rgba(0,0,0,.34), 0 0 0 1px rgba(255,255,255,.12) inset;
}
#mobileMenu .media-detail-art img{
  object-fit:contain;
}
#mobileMenu .media-detail-cover-actions{
  position:absolute;
  inset:auto 12px 12px auto;
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap:0;
  padding:0;
  border:0;
  background:transparent;
  box-shadow:none;
  pointer-events:none;
}
#mobileMenu .media-detail-cover-actions .media-detail-play-btn{
  width:40px;
  min-width:40px;
  height:40px;
  border-radius:999px;
  background:rgba(10,12,18,.48)!important;
  border:1px solid rgba(255,255,255,.22)!important;
  color:#fff!important;
  box-shadow:0 10px 24px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.12);
  backdrop-filter:blur(14px);
  -webkit-backdrop-filter:blur(14px);
  pointer-events:auto;
}
#mobileMenu .media-detail-cover-actions .media-detail-play-btn[data-media-detail-action="play"]{
  background:linear-gradient(135deg, rgba(var(--detail-accent-rgb) / .62), rgba(255,255,255,.16))!important;
}
#mobileMenu .media-detail-cover-actions .media-detail-play-btn.like.active{
  color:rgb(var(--detail-accent-rgb))!important;
  border-color:rgba(var(--detail-accent-rgb) / .42)!important;
  background:rgba(10,12,18,.58)!important;
}
#mobileMenu .media-detail-cover-actions .media-detail-play-btn .ui-ic{
  width:17px;
  height:17px;
}
#mobileMenu .media-detail-hero-actions{
  justify-content:flex-start;
  gap:12px;
  margin-top:2px;
}
#mobileMenu.rtl .media-detail-hero-actions,
.rtl #mobileMenu .media-detail-hero-actions{
  justify-content:flex-end;
}
#mobileMenu .media-detail-hero-actions .media-detail-play-btn{
  width:42px;
  min-width:42px;
  height:42px;
  border-radius:999px;
}
#mobileMenu .media-detail-hero-actions .media-detail-play-btn[data-media-detail-action="play"]{
  background:linear-gradient(135deg, rgba(var(--detail-accent-rgb) / .64), rgba(255,255,255,.14))!important;
}
#mobileMenu .media-detail-copy{
  grid-area:copy;
  align-self:center;
  justify-self:stretch;
  gap:9px;
  max-width:720px;
}
#mobileMenu .media-detail-title{
  font-size:clamp(24px, 3.2cqi, 42px);
  line-height:1.05;
}
#mobileMenu .media-detail-sub{
  display:flex;
  align-items:center;
  flex-wrap:wrap;
  gap:8px;
  white-space:normal;
  font-size:clamp(13px, 1.45cqi, 18px);
  font-weight:800;
}
#mobileMenu .media-detail-sub .media-detail-kind-badge{
  margin-inline-start:0;
}
#mobileMenu .media-detail-album-picker{
  width:min(100%, 360px);
  max-width:360px;
  grid-template-columns:1fr;
  justify-self:start;
  margin-top:12px;
}
#mobileMenu.rtl .media-detail-album-picker,
.rtl #mobileMenu .media-detail-album-picker{
  justify-self:end;
}
#mobileMenu .media-detail-picker-label{
  display:none;
}
#mobileMenu .media-detail-album-picker select{
  height:40px;
  border-radius:16px;
  padding-inline:14px 36px;
  font-size:13px;
}
#mobileMenu .artist-detail-hero{
  min-height:128px;
  grid-template-columns:112px minmax(0,1fr) auto;
  grid-template-areas:"art copy actions";
  align-items:center;
}
#mobileMenu.rtl .artist-detail-hero,
.rtl #mobileMenu .artist-detail-hero{
  grid-template-columns:auto minmax(0,1fr) 112px;
  grid-template-areas:"actions copy art";
}
#mobileMenu .artist-detail-art{
  grid-area:art;
  width:112px;
  border-radius:999px;
  box-shadow:0 18px 36px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.12);
}
#mobileMenu .artist-detail-art img{
  object-fit:cover;
}
#mobileMenu .artist-detail-copy{
  grid-area:copy;
}
#mobileMenu.rtl .artist-detail-copy,
.rtl #mobileMenu .artist-detail-copy{
  justify-items:end;
  text-align:end;
}
#mobileMenu .artist-detail-actions{
  grid-area:actions;
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap:8px;
  align-self:start;
  padding-top:4px;
}
#mobileMenu .artist-hero-icon-btn,
#mobileMenu .artist-info-btn{
  width:34px;
  min-width:34px;
  height:34px;
  min-height:34px;
  padding:0;
  border:0!important;
  border-radius:999px;
  background:transparent!important;
  box-shadow:none!important;
  color:rgba(255,255,255,.82)!important;
  display:grid;
  place-items:center;
  cursor:pointer;
}
#mobileMenu .artist-hero-icon-btn[aria-expanded="true"],
#mobileMenu .artist-hero-icon-btn:hover,
#mobileMenu .artist-info-btn:hover{
  background:rgba(var(--detail-accent-rgb) / .16)!important;
  color:rgb(var(--detail-accent-rgb))!important;
}
#mobileMenu .artist-hero-icon-btn .ui-ic,
#mobileMenu .artist-info-btn .ui-ic{
  width:17px;
  height:17px;
}
#mobileMenu .artist-detail-search{
  margin-top:-4px;
}
#mobileMenu .artist-search-shell{
  width:min(100%, 520px);
  min-height:44px;
  justify-self:stretch;
  grid-template-columns:auto minmax(0,1fr) auto;
  padding:6px 8px;
  border-radius:18px;
}
#mobileMenu .artist-search-shell input{
  min-height:30px;
  font-size:13px;
}
#mobileMenu .artist-search-btn{
  width:auto;
  grid-column:auto;
  min-height:32px;
  padding:0 13px;
  border-radius:999px;
}
#mobileMenu .library-toolbar-minimal{
  display:grid!important;
  grid-template-columns:auto minmax(0,1fr) auto auto;
  align-items:center!important;
  gap:10px!important;
  margin:0 0 12px!important;
  padding:0 2px;
}
#mobileMenu .library-toolbar-minimal .library-toolbar-actions{
  flex:0 0 auto;
  display:flex;
  align-items:center;
  gap:8px;
  min-width:0;
  flex-wrap:nowrap;
}
#mobileMenu .library-toolbar-minimal .library-toolbar-sort{
  justify-content:flex-start;
}
#mobileMenu .library-toolbar-minimal .library-toolbar-icons{
  justify-content:flex-end;
}
#mobileMenu .library-toolbar-minimal .library-toolbar-player{
  min-width:0;
  justify-self:center;
}
#mobileMenu .library-toolbar-minimal .library-player-focus{
  width:auto!important;
  max-width:min(34vw, 220px);
  min-height:34px!important;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  padding:0 11px!important;
  border-radius:999px!important;
  background:rgba(255,255,255,.055)!important;
  border:1px solid rgba(255,255,255,.1)!important;
  box-shadow:none!important;
}
#mobileMenu .library-toolbar-minimal .library-player-art{
  width:18px!important;
  height:18px!important;
  min-width:18px;
  border:0!important;
  border-radius:999px!important;
  background:transparent!important;
}
#mobileMenu .library-toolbar-minimal .library-player-art img,
#mobileMenu .library-toolbar-minimal .library-player-state,
#mobileMenu .library-toolbar-minimal .library-player-focus .eq-icon,
#mobileMenu .library-toolbar-minimal .library-focus-badge{
  display:none!important;
}
#mobileMenu .library-toolbar-minimal .library-player-copy{
  display:block;
  min-width:0;
}
#mobileMenu .library-toolbar-minimal .library-player-name{
  display:block;
  max-width:100%;
  overflow:hidden;
  white-space:nowrap;
  text-overflow:ellipsis;
  font-size:12px;
  font-weight:850;
}
#mobileMenu .library-toolbar-minimal .media-sort-select{
  min-width:128px;
  width:auto;
  height:38px;
  min-height:38px;
  padding:0 13px;
  border-radius:999px;
  font-size:12px;
  font-weight:850;
}
#mobileMenu .library-toolbar-minimal .media-layout-toggle{
  background:transparent!important;
  border:0!important;
  box-shadow:none!important;
  padding:0!important;
  gap:7px!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
#mobileMenu .library-toolbar-minimal .media-layout-btn{
  width:36px;
  min-width:36px;
  height:36px;
  min-height:36px;
  padding:0;
  border-radius:999px!important;
  background:rgba(255,255,255,.075)!important;
  border:1px solid rgba(255,255,255,.12)!important;
  box-shadow:none!important;
}
#mobileMenu .library-toolbar-minimal .library-flow-toggle,
#mobileMenu .artist-section-actions .artist-album-flow-toggle{
  width:auto!important;
  min-width:86px!important;
  padding:0 10px!important;
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  gap:6px!important;
  font-size:11px!important;
  line-height:1!important;
}
#mobileMenu .library-toolbar-minimal .library-flow-toggle{
  width:36px!important;
  min-width:36px!important;
  padding:0!important;
}
#mobileMenu .library-toolbar-minimal .library-flow-toggle span{
  display:none!important;
}
#mobileMenu .library-flow-toggle span{
  min-width:0;
  max-width:86px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  font-size:11px;
  font-weight:900;
  line-height:1;
}
#mobileMenu .library-flow-toggle .ui-ic{
  width:16px!important;
  height:16px!important;
}
#mobileMenu .library-toolbar-minimal .media-layout-btn[data-media-layout]{
  display:none!important;
}
#mobileMenu .library-toolbar-minimal .media-layout-btn.active{
  color:#fff!important;
  background:rgba(var(--detail-accent-rgb) / .3)!important;
  border-color:rgba(var(--detail-accent-rgb) / .36)!important;
}
#mobileMenu .library-toolbar-minimal{
  direction:rtl;
  grid-template-columns:minmax(126px, max-content) minmax(0, 1fr) max-content max-content;
  overflow:visible;
}
#mobileMenu .library-toolbar-player{
  grid-column:1;
  justify-self:end;
  min-width:0;
}
#mobileMenu .library-toolbar-search-inline{
  grid-column:2;
  justify-self:stretch;
}
#mobileMenu .library-toolbar-icons{
  grid-column:3;
  justify-self:start;
}
#mobileMenu .library-toolbar-sort{
  grid-column:4;
  justify-self:start;
}
#mobileMenu .library-toolbar-minimal .library-player-focus,
#mobileMenu .library-toolbar-minimal .library-toolbar-icons,
#mobileMenu .library-toolbar-minimal .library-toolbar-sort,
#mobileMenu .library-toolbar-minimal .media-layout-toggle{
  direction:rtl;
}
#mobileMenu .library-toolbar-minimal .media-sort-select,
#mobileMenu .library-toolbar-minimal .library-tab-search-row,
#mobileMenu .library-toolbar-minimal .library-toolbar-search{
  direction:auto;
}
@media (max-width:430px){
  #mobileMenu .artist-section-actions .artist-album-flow-toggle{
    min-width:74px!important;
    padding:0 8px!important;
  }
  #mobileMenu .artist-section-actions .artist-album-flow-toggle span{
    max-width:68px;
    font-size:10px;
  }
}
#mobileMenu .library-toolbar-minimal .library-toolbar-icons,
#mobileMenu .library-toolbar-minimal .library-toolbar-sort{
  min-height:42px;
  padding:4px;
  gap:6px;
  border-radius:999px;
  background:rgba(255,255,255,.055);
  border:1px solid rgba(255,255,255,.1);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.06);
}
#mobileMenu .library-toolbar-search,
#mobileMenu .library-tab-search-row{
  min-width:0;
  min-height:42px;
  display:grid;
  grid-template-columns:30px minmax(0,1fr) 28px;
  align-items:center;
  gap:8px;
  padding:0 12px;
  border-radius:999px;
  background:rgba(255,255,255,.07);
  border:1px solid rgba(255,255,255,.11);
  color:rgba(255,255,255,.86);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.06);
}
#mobileMenu .library-tab-search-row{
  margin:-4px 2px 10px;
  display:none;
}
#mobileMenu .library-toolbar-search input,
#mobileMenu .library-tab-search-row input{
  min-width:0;
  width:100%;
  border:0;
  outline:0;
  background:transparent;
  color:inherit;
  font:inherit;
  font-size:13px;
  font-weight:780;
  direction:auto;
}
.card:not(.rtl) #mobileMenu .library-toolbar-search input,
.card:not(.rtl) #mobileMenu .library-tab-search-row input{
  direction:ltr;
  text-align:left;
}
.card.rtl #mobileMenu .library-toolbar-search input,
.card.rtl #mobileMenu .library-tab-search-row input{
  direction:rtl;
  text-align:right;
}
#mobileMenu .library-toolbar-search input::placeholder,
#mobileMenu .library-tab-search-row input::placeholder{
  color:rgba(255,255,255,.46);
}
#mobileMenu .library-tab-search-icon{
  display:grid;
  place-items:center;
  color:rgba(255,255,255,.68);
}
#mobileMenu .library-tab-search-submit{
  width:30px;
  height:30px;
  border:0;
  border-radius:999px;
  background:rgba(255,255,255,.07);
  cursor:pointer;
  padding:0;
}
#mobileMenu .library-tab-search-icon .ui-ic{
  width:18px;
  height:18px;
}
#mobileMenu .library-tab-search-clear{
  width:28px;
  height:28px;
  border:0;
  border-radius:999px;
  display:grid;
  place-items:center;
  background:transparent;
  color:rgba(255,255,255,.62);
  font-size:20px;
  font-weight:900;
  line-height:1;
  opacity:0;
  pointer-events:none;
  cursor:pointer;
}
#mobileMenu .library-tab-search-clear.visible{
  opacity:1;
  pointer-events:auto;
  background:rgba(255,255,255,.08);
}
#mobileMenu .library-toolbar-search-toggle{
  display:none;
}
#mobileMenu .artist-detail-shell .album-card-badge{
  position:absolute;
  inset-inline-start:18px;
  inset-block-start:calc(10px + var(--media-grid-thumb-size, 188px) - 32px);
  z-index:3;
  max-width:calc(100% - 92px);
  min-height:24px;
  display:inline-flex;
  align-items:center;
  gap:5px;
  padding:0 9px;
  border-radius:999px;
  background:rgba(12,15,22,.64);
  border:1px solid rgba(255,255,255,.18);
  color:rgba(255,255,255,.88);
  font-size:10px;
  font-weight:900;
  line-height:1;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  box-shadow:0 12px 24px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.12);
  backdrop-filter:blur(12px);
  -webkit-backdrop-filter:blur(12px);
}
#mobileMenu .artist-detail-shell .album-card-badge-kind{
  color:color-mix(in srgb, var(--ma-accent) 86%, white 14%);
}
#mobileMenu .artist-detail-shell .album-card-badge-count{
  color:rgba(255,255,255,.74);
}
.theme-light #mobileMenu .library-toolbar-minimal .library-toolbar-icons,
.theme-light #mobileMenu .library-toolbar-minimal .library-toolbar-sort,
.theme-light #mobileMenu .library-toolbar-search,
.theme-light #mobileMenu .library-tab-search-row{
  background:rgba(255,255,255,.78);
  border-color:rgba(123,139,164,.22);
  color:#172033;
}
.theme-light #mobileMenu .library-toolbar-search input::placeholder,
.theme-light #mobileMenu .library-tab-search-row input::placeholder{
  color:rgba(50,62,78,.48);
}
.theme-light #mobileMenu .library-tab-search-submit{
  background:rgba(31,41,55,.06);
  color:rgba(31,41,55,.7);
}
.theme-light #mobileMenu .library-tab-search-icon,
.theme-light #mobileMenu .library-tab-search-clear{
  color:rgba(50,62,78,.62);
}
.theme-light #mobileMenu .artist-detail-shell .album-card-badge{
  background:rgba(255,255,255,.82);
  border-color:rgba(123,139,164,.22);
  color:#172033;
  box-shadow:0 10px 22px rgba(86,104,132,.12), inset 0 1px 0 rgba(255,255,255,.68);
}
.theme-light #mobileMenu .artist-detail-shell .album-card-badge-count{
  color:#607086;
}
#mobileMenu .media-detail-play-btn,
#mobileMenu .media-detail-action-btn.primary,
#mobileMenu .artist-search-btn{
  border-color:rgba(var(--detail-accent-rgb) / .34);
  background:linear-gradient(135deg, rgba(var(--detail-accent-rgb) / .42), rgba(255,255,255,.08));
  box-shadow:0 16px 34px rgba(var(--detail-accent-rgb) / .14), inset 0 1px 0 rgba(255,255,255,.14);
}
#mobileMenu .media-detail-album-picker select,
#mobileMenu .media-detail-kind-badge{
  border-color:rgba(var(--detail-accent-rgb) / .28);
  background:rgba(var(--detail-accent-rgb) / .13);
}
#mobileMenu .menu-sheet:is(.sheet-library,.sheet-discovery) .media-entry.grid,
#mobileMenu .media-entry.grid.media-type-artist,
#mobileMenu .artist-detail-shell .media-entry.grid.media-type-album{
  justify-items:stretch;
  align-content:start;
  padding:10px 10px 14px;
  border-radius:16px;
  text-align:start;
  background:transparent!important;
  border-color:transparent!important;
  box-shadow:none;
}
#mobileMenu .menu-sheet:is(.sheet-library,.sheet-discovery) .media-entry.grid .media-entry-main,
#mobileMenu .media-entry.grid.media-type-artist .media-entry-main,
#mobileMenu .artist-detail-shell .media-entry.grid.media-type-album .media-entry-main{
  justify-items:stretch;
}
#mobileMenu .menu-sheet:is(.sheet-library,.sheet-discovery) .media-entry.grid .menu-thumb,
#mobileMenu .media-entry.grid.media-type-artist .menu-thumb,
#mobileMenu .artist-detail-shell .media-entry.grid.media-type-album .menu-thumb{
  width:100%;
  max-width:none;
  height:auto;
  min-height:0;
  aspect-ratio:1;
  border-radius:12px;
  background:transparent;
  justify-self:stretch;
}
#mobileMenu .menu-sheet:is(.sheet-library,.sheet-discovery) .media-entry.grid .menu-thumb img,
#mobileMenu .media-entry.grid.media-type-artist .menu-thumb img{
  object-fit:cover;
}
#mobileMenu .menu-sheet:is(.sheet-library,.sheet-discovery) .media-entry.grid.media-type-album .menu-thumb img,
#mobileMenu .menu-sheet:is(.sheet-library,.sheet-discovery) .media-entry.grid.media-type-playlist .menu-thumb img,
#mobileMenu .menu-sheet:is(.sheet-library,.sheet-discovery) .media-entry.grid.media-type-podcast .menu-thumb img{
  object-fit:contain;
}
#mobileMenu .artist-detail-shell .media-entry.grid.media-type-album .menu-thumb img{
  object-fit:contain;
}
#mobileMenu .menu-sheet:is(.sheet-library,.sheet-discovery) .media-entry.grid .media-play-btn,
#mobileMenu .media-entry.grid.media-type-artist .media-play-btn,
#mobileMenu .artist-detail-shell .media-entry.grid.media-type-album .media-play-btn{
  inset-block-start:18px;
  inset-block-end:auto;
  inset-inline-end:18px;
  width:40px;
  min-width:40px;
  height:40px;
  min-height:40px;
  border-radius:14px;
  background:rgba(20,22,28,.82)!important;
  color:#fff!important;
  box-shadow:0 3px 10px #0003;
}
#mobileMenu .menu-sheet:is(.sheet-library,.sheet-discovery) .media-entry.grid .media-more-btn,
#mobileMenu .media-entry.grid.media-type-artist .media-more-btn,
#mobileMenu .artist-detail-shell .media-entry.grid.media-type-album .media-more-btn{
  width:40px;
  height:40px;
  min-width:40px;
  min-height:40px;
  border-radius:14px;
  background:rgba(20,22,28,.82)!important;
  color:#fff!important;
  box-shadow:0 3px 10px #0003;
  opacity:1;
}
#mobileMenu .menu-sheet:is(.sheet-library,.sheet-discovery) .media-entry.grid .menu-item-sub,
#mobileMenu .media-entry.grid.media-type-artist .menu-item-sub{
  display:none;
}
#mobileMenu .menu-sheet:is(.sheet-library,.sheet-discovery) .media-entry.grid .menu-item-title,
#mobileMenu .media-entry.grid.media-type-artist .menu-item-title,
#mobileMenu .artist-detail-shell .media-entry.grid.media-type-album .menu-item-title{
  text-align:start;
  font-size:14px;
  font-weight:550;
  line-height:1.5;
  -webkit-line-clamp:2;
}
#mobileMenu .menu-sheet.sheet-library .media-layout-btn[data-media-layout]{
  display:none;
}
.theme-light #mobileMenu.has-menu-detail-theme .menu-sheet.sheet-media-detail,
.theme-light #mobileMenu.has-menu-detail-theme .menu-sheet.sheet-artist-detail,
.theme-light #mobileMenu.has-menu-detail-theme .menu-sheet.sheet-library{
  background:
    radial-gradient(circle at 18% 0%, rgba(var(--detail-accent-rgb) / .16), transparent 36%),
    radial-gradient(circle at 86% 18%, rgba(var(--detail-glow-rgb) / .12), transparent 34%),
    linear-gradient(180deg, rgba(255,255,255,.94), rgba(239,244,251,.96))!important;
}
.theme-light #mobileMenu.has-menu-detail-theme .menu-sheet.sheet-media-detail::after,
.theme-light #mobileMenu.has-menu-detail-theme .menu-sheet.sheet-artist-detail::after,
.theme-light #mobileMenu.has-menu-detail-theme .menu-sheet.sheet-library::after{
  background:linear-gradient(180deg, rgba(255,255,255,.76), rgba(246,249,253,.93));
}
.theme-light #mobileMenu .media-detail-hero::after,
.theme-light #mobileMenu .artist-detail-hero::after{
  background:
    linear-gradient(90deg, rgba(255,255,255,.82), rgba(246,249,253,.58) 58%, rgba(255,255,255,.84)),
    radial-gradient(circle at 18% 12%, rgba(var(--detail-accent-rgb) / .12), transparent 40%);
}
@media (max-width: 620px){
  #mobileMenu .artist-detail-hero{
    min-height:104px;
    grid-template-columns:82px minmax(0,1fr) 112px;
    grid-template-areas:"art copy actions";
    gap:10px;
    padding:13px;
  }
  #mobileMenu.rtl .artist-detail-hero,
  .rtl #mobileMenu .artist-detail-hero{
    grid-template-columns:112px minmax(0,1fr) 82px;
    grid-template-areas:"actions copy art";
  }
  #mobileMenu .artist-detail-art{
    width:82px;
  }
  #mobileMenu .artist-detail-actions{
    flex-direction:row;
    align-self:center;
    justify-content:flex-end;
    padding-top:0;
  }
  #mobileMenu .artist-hero-icon-btn,
  #mobileMenu .artist-info-btn{
    width:32px;
    min-width:32px;
    height:32px;
    min-height:32px;
  }
  #mobileMenu .album-detail-player{
    grid-template-columns:minmax(112px, 34vw) minmax(0,1fr);
    grid-template-areas:"art copy";
    min-height:auto;
    gap:12px;
    padding:11px;
    text-align:start;
  }
  #mobileMenu.rtl .album-detail-player,
  .rtl #mobileMenu .album-detail-player{
    grid-template-columns:minmax(0,1fr) minmax(112px, 34vw);
    grid-template-areas:"copy art";
    text-align:end;
  }
  #mobileMenu .media-detail-art-stage{
    width:min(34vw, 154px);
  }
  #mobileMenu .media-detail-copy{
    justify-items:start;
    max-width:none;
    gap:5px;
  }
  #mobileMenu.rtl .media-detail-copy,
  .rtl #mobileMenu .media-detail-copy{
    justify-items:end;
  }
  #mobileMenu .media-detail-title{
    font-size:clamp(19px, 6vw, 24px);
    -webkit-line-clamp:2;
  }
  #mobileMenu .media-detail-sub{
    justify-content:flex-start;
    font-size:12px;
  }
  #mobileMenu.rtl .media-detail-sub,
  .rtl #mobileMenu .media-detail-sub{
    justify-content:flex-end;
  }
  #mobileMenu .media-detail-album-picker,
  #mobileMenu.rtl .media-detail-album-picker,
  .rtl #mobileMenu .media-detail-album-picker{
    width:min(100%, 236px);
    justify-self:start;
    margin-top:4px;
  }
  #mobileMenu.rtl .media-detail-album-picker,
  .rtl #mobileMenu .media-detail-album-picker{
    justify-self:end;
  }
  #mobileMenu .media-detail-album-picker select{
    height:34px;
    font-size:12px;
    border-radius:999px;
  }
  #mobileMenu .media-detail-cover-actions{
    inset:auto 10px 10px auto;
    flex-direction:row!important;
  }
  #mobileMenu .media-detail-cover-actions .media-detail-play-btn{
    width:34px;
    min-width:34px;
    height:34px;
  }
  #mobileMenu .media-detail-hero-actions{
    flex-direction:row!important;
    justify-content:flex-start;
    gap:8px;
    margin-top:1px;
  }
  #mobileMenu.rtl .media-detail-hero-actions,
  .rtl #mobileMenu .media-detail-hero-actions{
    justify-content:flex-end;
  }
  #mobileMenu .media-detail-hero-actions .media-detail-play-btn{
    width:34px;
    min-width:34px;
    height:34px;
  }
  #mobileMenu .library-toolbar-minimal{
    grid-template-columns:minmax(124px, 148px) minmax(0,1fr) minmax(86px, 104px);
    margin:0 0 8px!important;
    padding:0;
    gap:7px!important;
  }
  #mobileMenu .library-toolbar-search-inline{
    display:none;
  }
  #mobileMenu .library-tab-search-row{
    display:grid;
  }
  #mobileMenu .library-toolbar-search-toggle{
    display:grid;
  }
  #mobileMenu .library-toolbar-icons{
    grid-column:2;
    justify-self:start;
  }
  #mobileMenu .library-toolbar-sort{
    grid-column:3;
    justify-self:start;
  }
  #mobileMenu .library-toolbar-minimal .library-toolbar-icons,
  #mobileMenu .library-toolbar-minimal .library-toolbar-sort{
    min-height:34px;
    padding:0;
    background:transparent;
    border:0;
    box-shadow:none;
    gap:5px;
  }
  #mobileMenu .library-toolbar-minimal .library-player-focus{
    max-width:148px;
    min-height:32px!important;
    padding:0 9px!important;
  }
  #mobileMenu .library-toolbar-minimal .library-player-art{
    width:16px!important;
    height:16px!important;
    min-width:16px;
  }
  #mobileMenu .library-toolbar-minimal .library-player-name{
    font-size:11px;
  }
  #mobileMenu .library-toolbar-minimal .media-sort-select{
    min-width:86px;
    max-width:104px;
    height:34px;
    min-height:34px;
    padding:0 9px;
    font-size:11px;
  }
  #mobileMenu .library-toolbar-minimal .media-layout-toggle{
    gap:6px!important;
  }
  #mobileMenu .library-toolbar-minimal .media-layout-btn{
    width:34px;
    min-width:34px;
    height:34px;
    min-height:34px;
  }
  #mobileMenu .menu-sheet:is(.sheet-library,.sheet-discovery) .media-entry.grid .media-play-btn,
  #mobileMenu .media-entry.grid.media-type-artist .media-play-btn,
  #mobileMenu .artist-detail-shell .media-entry.grid.media-type-album .media-play-btn{
    width:44px;
    min-width:44px;
    height:44px;
    min-height:44px;
    inset-block-start:18px;
    inset-block-end:auto;
  }
  #mobileMenu .artist-detail-shell .album-card-badge{
    inset-inline-start:16px;
    inset-block-start:calc(10px + var(--media-grid-thumb-size, 164px) - 30px);
    max-width:calc(100% - 76px);
    min-height:22px;
    padding:0 8px;
    font-size:9px;
  }
}
@keyframes screensaverBreath{
  0%,100%{transform:scale(1.08);filter:blur(22px) saturate(1.12);}
  50%{transform:scale(1.14);filter:blur(28px) saturate(1.26);}
}
@keyframes screensaverEmptyDrift{
  0%,100%{transform:scale(1.08) translate3d(0,0,0);}
  50%{transform:scale(1.14) translate3d(2%, -1%, 0);}
}
@keyframes screensaverLightFieldOne{
  0%,100%{transform:translate3d(-2%,1%,0) scale(.98);opacity:.4;filter:blur(2px) saturate(1.12);}
  30%{transform:translate3d(5%,-4%,0) scale(1.08);opacity:.56;filter:blur(4px) saturate(1.24);}
  62%{transform:translate3d(-5%,-1%,0) scale(1.16);opacity:.44;filter:blur(3px) saturate(1.18);}
  82%{transform:translate3d(2%,4%,0) scale(1.03);opacity:.52;filter:blur(1px) saturate(1.2);}
}
@keyframes screensaverLightFieldTwo{
  0%,100%{transform:translate3d(3%,-2%,0) scale(1.02);opacity:.3;filter:blur(2px) saturate(1.05);}
  42%{transform:translate3d(-4%,4%,0) scale(1.18);opacity:.44;filter:blur(5px) saturate(1.2);}
  72%{transform:translate3d(2%,1%,0) scale(.96);opacity:.36;filter:blur(1px) saturate(1.12);}
}
@keyframes screensaverImageIn{
  from{opacity:.38;transform:scale(1.015);}
  to{opacity:1;transform:scale(1);}
}
@keyframes screensaverArtGuard{
  0%,100%{transform:translate3d(-3px,2px,0);}
  25%{transform:translate3d(4px,-2px,0);}
  50%{transform:translate3d(2px,4px,0);}
  75%{transform:translate3d(-4px,-3px,0);}
}
@keyframes screensaverTextGuard{
  0%,100%{transform:translate3d(3px,-2px,0);opacity:.96;}
  33%{transform:translate3d(-4px,3px,0);opacity:.9;}
  66%{transform:translate3d(2px,4px,0);opacity:.94;}
}
@keyframes screensaverBrandGuard{
  0%,100%{transform:translate3d(0,0,0);opacity:.72;}
  50%{transform:translate3d(5px,-4px,0);opacity:.58;}
}
@keyframes screensaverClockGuard{
  0%,100%{transform:translate(calc(-50% - 4px), calc(-50% + 3px)) scale(var(--screensaver-clock-scale, 1));}
  25%{transform:translate(calc(-50% + 5px), calc(-50% - 2px)) scale(var(--screensaver-clock-scale, 1));}
  50%{transform:translate(calc(-50% + 2px), calc(-50% + 5px)) scale(var(--screensaver-clock-scale, 1));}
  75%{transform:translate(calc(-50% - 5px), calc(-50% - 3px)) scale(var(--screensaver-clock-scale, 1));}
}
@keyframes screensaverClockGlow{
  0%,100%{text-shadow:0 10px 36px rgba(0,0,0,.48), 0 0 0 rgba(var(--dynamic-accent-rgb,245 166 35) / 0);}
  50%{text-shadow:0 14px 42px rgba(0,0,0,.52), 0 0 28px rgba(var(--dynamic-accent-rgb,245 166 35) / .26), 0 0 56px rgba(96,165,250,.14);}
}
@keyframes screensaverClockRingPulse{
  0%,100%{box-shadow:inset 0 0 0 10px rgba(255,255,255,.05), 0 24px 60px rgba(0,0,0,.28), 0 0 0 rgba(var(--dynamic-accent-rgb,245 166 35) / 0);}
  50%{box-shadow:inset 0 0 0 10px rgba(255,255,255,.07), 0 28px 70px rgba(0,0,0,.3), 0 0 34px rgba(var(--dynamic-accent-rgb,245 166 35) / .22), 0 0 68px rgba(96,165,250,.12);}
}
@media (prefers-reduced-motion: reduce){
  .screensaver-backdrop,
  .screensaver-backdrop .screensaver-shell,
  .screensaver-backdrop .screensaver-action-cluster,
  .screensaver-backdrop .screensaver-brand{
    transition:none!important;
  }
  .screensaver-backdrop.empty-mode::before,
  .screensaver-backdrop.empty-mode::after,
  .screensaver-backdrop.empty-mode .screensaver-bg,
  .screensaver-backdrop.open .screensaver-art,
  .screensaver-backdrop.open .screensaver-track,
  .screensaver-backdrop.open .screensaver-message,
  .screensaver-backdrop.open .screensaver-next,
  .screensaver-backdrop.open .screensaver-brand,
  .screensaver-backdrop.open .screensaver-clock,
  .screensaver-backdrop.open .screensaver-analog-clock{
    animation:none!important;
  }
}
@media (max-width: 620px){
  .screensaver-shell{
    grid-template-columns:1fr;
    justify-items:center;
    text-align:center;
    gap:20px;
  }
  .screensaver-art{
    width:min(62vw, 230px);
  }
  .screensaver-art-wrap{
    width:min(62vw, 230px);
  }
  .screensaver-art-wrap .screensaver-art{
    width:100%;
  }
  .screensaver-clock{
    font-size:64px;
  }
  .screensaver-analog-clock{
    width:150px;
  }
  .screensaver-title,
  .screensaver-artist{
    white-space:normal;
  }
  .screensaver-next{
    width:min(90vw, 340px);
  }
  .screensaver-next-main{
    grid-template-columns:46px minmax(0, 1fr);
    gap:10px;
  }
  .screensaver-next-art{
    width:46px;
    border-radius:14px;
  }
  .screensaver-action-cluster{
    inset-inline-end:18px;
    inset-block-end:18px;
    gap:6px;
    flex-wrap:nowrap;
    max-width:calc(100vw - 36px);
  }
  .screensaver-voice-btn{
    width:58px;
    height:58px;
  }
  .screensaver-control-btn{
    width:44px;
    height:44px;
  }
}


`;
}
