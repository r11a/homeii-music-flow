// screensaver styles. Order is preserved by card-styles.js.
export default function() {
  return `.screensaver-backdrop.open{
  opacity:1;
  pointer-events:auto;
}
.screensaver-backdrop.closing{
  opacity:0;
  pointer-events:none;
  transition-duration:.42s;
}
.screensaver-backdrop .screensaver-shell,
.screensaver-backdrop .screensaver-action-cluster,
.screensaver-backdrop .screensaver-brand{
  opacity:0;
  transform:translate3d(0, 10px, 0);
  transition:opacity .5s cubic-bezier(.22,.78,.24,1), transform .5s cubic-bezier(.22,.78,.24,1), filter .5s ease;
  will-change:opacity, transform;
}
.screensaver-backdrop.open .screensaver-shell,
.screensaver-backdrop.open .screensaver-action-cluster{
  opacity:1;
  transform:translate3d(0, 0, 0);
}
.screensaver-backdrop.open .screensaver-brand{
  opacity:.74;
  transform:translate3d(0, 0, 0);
}
.screensaver-backdrop.closing .screensaver-shell,
.screensaver-backdrop.closing .screensaver-action-cluster,
.screensaver-backdrop.closing .screensaver-brand{
  opacity:0;
  transform:translate3d(0, -6px, 0);
  transition-duration:.34s;
}
.screensaver-action-cluster{
  position:absolute;
  inset-inline-end:clamp(22px, 3vw, 48px);
  inset-block-end:clamp(20px, 2.8vh, 42px);
  z-index:5;
  display:flex;
  align-items:center;
  justify-content:flex-end;
  flex-wrap:nowrap;
  gap:clamp(6px, .8vw, 10px);
  max-width:min(92vw, 860px);
  overflow:visible;
}
.screensaver-voice-btn{
  position:relative;
  width:clamp(56px, 5.8vw, 72px);
  height:clamp(56px, 5.8vw, 72px);
  border-radius:999px;
  border:1px solid rgba(255,255,255,.115);
  background:rgba(255,255,255,.045);
  color:rgba(255,255,255,.7);
  display:grid;
  place-items:center;
  cursor:pointer;
  box-shadow:0 16px 34px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.075);
  backdrop-filter:blur(24px) saturate(108%);
  -webkit-backdrop-filter:blur(24px) saturate(108%);
  opacity:.48;
  filter:saturate(.9);
  transition:opacity .18s ease, transform .18s ease, background .18s ease, border-color .18s ease, color .18s ease, box-shadow .18s ease, filter .18s ease;
}
.screensaver-control-btn{
  flex:0 0 auto;
  width:clamp(44px, 4.2vw, 58px);
  height:clamp(44px, 4.2vw, 58px);
  opacity:.34;
}
.screensaver-control-btn.primary{
  opacity:.48;
}
.screensaver-voice-btn .ui-ic{
  width:32%;
  height:32%;
}
.screensaver-voice-btn:hover,
.screensaver-voice-btn:focus-visible,
.screensaver-voice-btn.pressed,
.screensaver-voice-btn.listening{
  opacity:.88;
  filter:saturate(1);
  color:#fff;
  border-color:color-mix(in srgb, var(--ma-accent) 42%, rgba(255,255,255,.18));
  background:linear-gradient(180deg, color-mix(in srgb, var(--ma-accent) 18%, rgba(255,255,255,.12)), rgba(255,255,255,.075));
  box-shadow:0 20px 46px color-mix(in srgb, var(--ma-accent) 14%, rgba(0,0,0,.26)), 0 0 0 8px color-mix(in srgb, var(--ma-accent) 8%, transparent), inset 0 1px 0 rgba(255,255,255,.16);
}
.screensaver-voice-btn:active,
.screensaver-voice-btn.pressed{
  transform:scale(.96);
}
.screensaver-voice-btn:disabled{
  cursor:default;
  opacity:.22;
  transform:none;
}
.screensaver-voice-btn.listening::after{
  content:"";
  position:absolute;
  inset:-9px;
  border-radius:inherit;
  border:1px solid color-mix(in srgb, var(--ma-accent) 42%, transparent);
  animation:voiceAssistantListenPulse 1.1s ease-out infinite;
}
.screensaver-backdrop.open .screensaver-art{
  animation:screensaverArtGuard 127s ease-in-out infinite;
}
.screensaver-backdrop.open .screensaver-track,
.screensaver-backdrop.open .screensaver-message,
.screensaver-backdrop.open .screensaver-next{
  animation:screensaverTextGuard 149s ease-in-out infinite;
}
.screensaver-backdrop.open .screensaver-brand{
  animation:screensaverBrandGuard 181s ease-in-out infinite;
}
.screensaver-bg{
  position:absolute;
  inset:-34px;
  background:
    linear-gradient(180deg, rgba(3,7,13,.46), rgba(3,7,13,.88)),
    var(--screensaver-art-url, none) center/cover no-repeat;
  filter:blur(22px) saturate(1.18);
  transform:scale(1.08);
  animation:screensaverBreath 16s ease-in-out infinite;
  z-index:-1;
}
.screensaver-backdrop.empty-mode{
  background:
    radial-gradient(circle at 18% 14%, rgba(var(--dynamic-accent-rgb,245 166 35) / .18), transparent 34%),
    radial-gradient(circle at 82% 22%, rgba(83,141,255,.16), transparent 30%),
    linear-gradient(135deg, #02060d, #070a12 52%, #02050a);
}
.screensaver-backdrop.empty-mode::before,
.screensaver-backdrop.empty-mode::after{
  content:"";
  position:absolute;
  inset:-18%;
  z-index:0;
  pointer-events:none;
  mix-blend-mode:screen;
  filter:blur(2px) saturate(1.2);
  will-change:transform, opacity, filter;
}
.screensaver-backdrop.empty-mode::before{
  background:
    radial-gradient(circle at 18% 74%, rgba(var(--dynamic-accent-rgb,245 166 35) / .28), transparent 14%),
    radial-gradient(circle at 76% 22%, rgba(96,165,250,.22), transparent 12%),
    radial-gradient(circle at 58% 86%, rgba(244,114,182,.16), transparent 12%),
    radial-gradient(circle at 34% 28%, rgba(255,255,255,.12), transparent 10%);
  opacity:.5;
  animation:screensaverLightFieldOne 26s ease-in-out infinite;
}
.screensaver-backdrop.empty-mode::after{
  inset:-24%;
  background:
    radial-gradient(circle at 84% 70%, rgba(45,212,191,.18), transparent 15%),
    radial-gradient(circle at 10% 18%, rgba(250,204,21,.16), transparent 11%),
    radial-gradient(circle at 52% 48%, rgba(147,197,253,.14), transparent 18%);
  opacity:.38;
  animation:screensaverLightFieldTwo 34s ease-in-out infinite;
}
.screensaver-backdrop.empty-mode .screensaver-bg{
  background:
    radial-gradient(circle at 18% 24%, rgba(var(--dynamic-accent-rgb,245 166 35) / .34), transparent 30%),
    radial-gradient(circle at 72% 38%, rgba(91,141,255,.22), transparent 34%),
    radial-gradient(circle at 48% 78%, rgba(255,255,255,.08), transparent 28%),
    linear-gradient(135deg, #050914, #080b10);
  filter:blur(30px) saturate(1.18);
  opacity:.92;
  animation:screensaverEmptyDrift 18s ease-in-out infinite;
}
.screensaver-backdrop.empty-mode .screensaver-shell,
.screensaver-backdrop.empty-mode .screensaver-brand{
  z-index:2;
}
.screensaver-backdrop.empty-mode.open .screensaver-clock{
  animation:screensaverClockGlow 5.8s ease-in-out infinite;
}
.screensaver-backdrop.empty-mode.open .screensaver-analog-clock{
  animation:screensaverClockRingPulse 5.8s ease-in-out infinite;
}
.screensaver-brand{
  display:none;
  position:absolute;
  left:clamp(34px, 4.8vw, 76px);
  bottom:clamp(26px, 4.4vh, 54px);
  width:clamp(94px, 9vw, 148px);
  color:rgba(255,255,255,.34);
  opacity:.74;
  filter:drop-shadow(0 12px 28px rgba(0,0,0,.34)) saturate(.9);
  pointer-events:none;
}
.screensaver-shell{
  position:relative;
  z-index:1;
  width:min(100%, 760px);
  display:grid;
  grid-template-columns:minmax(150px, 260px) minmax(0, 1fr);
  gap:28px;
  align-items:end;
}
.screensaver-art-wrap{
  position:relative;
  width:100%;
  min-width:0;
}
.screensaver-art{
  aspect-ratio:1;
  width:100%;
  border-radius:30px;
  overflow:hidden;
  background:rgba(255,255,255,.1);
  border:1px solid rgba(255,255,255,.16);
  box-shadow:0 28px 70px rgba(0,0,0,.36);
}
.screensaver-art img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
  opacity:.9;
  animation:screensaverImageIn .32s ease-out;
}
.screensaver-like-btn{
  position:absolute;
  inset-inline-end:clamp(10px, 4%, 18px);
  inset-block-end:clamp(10px, 4%, 18px);
  z-index:4;
  opacity:.72;
  width:clamp(48px, 5vw, 62px);
  height:clamp(48px, 5vw, 62px);
  color:rgba(255,255,255,.82);
  background:rgba(9,12,18,.38);
}
.screensaver-like-btn.active{
  color:#f5a623;
  opacity:.96;
  border-color:rgba(245,166,35,.34);
  box-shadow:0 18px 38px rgba(0,0,0,.28), 0 0 0 8px rgba(245,166,35,.08), inset 0 1px 0 rgba(255,255,255,.12);
}
.screensaver-like-btn[hidden]{
  display:none!important;
}
.screensaver-backdrop.empty-mode .screensaver-art{
  display:grid;
  place-items:center;
  background:
    radial-gradient(circle at 50% 42%, rgba(255,255,255,.08), transparent 58%),
    linear-gradient(145deg, rgba(255,255,255,.10), rgba(255,255,255,.035));
  border-color:rgba(255,255,255,.14);
}
.screensaver-empty-logo{
  width:68%;
  max-width:260px;
  height:auto;
  color:rgba(255,255,255,.58);
  opacity:.88;
  filter:drop-shadow(0 18px 34px rgba(0,0,0,.34));
}
.screensaver-backdrop.empty-mode .screensaver-artist:empty{
  display:none;
}
.screensaver-info{
  min-width:0;
  color:#fff;
  text-shadow:0 10px 36px rgba(0,0,0,.48);
  align-self:end;
}
.screensaver-lyrics{
  display:none;
  min-width:0;
  max-width:100%;
  color:#fff;
  text-align:start;
  text-shadow:0 16px 42px rgba(0,0,0,.54);
}
.screensaver-lyric-line{
  max-width:100%;
  font-size:calc(clamp(24px, 4.2vw, 58px) * var(--lyrics-font-scale, 1));
  line-height:1.14;
  font-weight:950;
  letter-spacing:0;
  opacity:.42;
  transform:translate3d(0, 0, 0);
  transition:opacity .24s ease, transform .24s ease, color .24s ease;
}
.screensaver-lyric-line.current{
  opacity:.96;
  color:#fff;
  transform:scale(1.015);
}
.screensaver-backdrop.lyrics-mode .screensaver-clock,
.screensaver-backdrop.lyrics-mode .screensaver-analog-clock,
.screensaver-backdrop.lyrics-mode .screensaver-next,
.screensaver-backdrop.lyrics-mode .screensaver-message{
  display:none!important;
}
.screensaver-backdrop.lyrics-mode .screensaver-shell{
  align-items:center;
}
.screensaver-backdrop.lyrics-mode .screensaver-info{
  align-self:center;
  display:grid;
  gap:clamp(18px, 2.8vh, 30px);
  max-width:min(58vw, 760px);
  padding-block-end:0;
}
.screensaver-backdrop.lyrics-mode .screensaver-track{
  margin-top:0;
  gap:clamp(5px, .8vh, 9px);
}
.screensaver-backdrop.lyrics-mode .screensaver-title{
  font-size:clamp(24px, 2.8vw, 42px);
  white-space:normal;
  overflow:visible;
  text-overflow:clip;
}
.screensaver-backdrop.lyrics-mode .screensaver-artist{
  font-size:clamp(14px, 1.5vw, 20px);
  white-space:normal;
  overflow:visible;
  text-overflow:clip;
}
.screensaver-backdrop.lyrics-mode .screensaver-lyrics{
  display:grid;
  gap:clamp(10px, 1.8vh, 18px);
  max-width:100%;
}
.screensaver-lyrics-lines{
  display:grid;
  gap:clamp(10px, 1.8vh, 18px);
}
.screensaver-clock{
  font-size:96px;
  line-height:.9;
  font-weight:950;
  font-variant-numeric:tabular-nums;
}
.screensaver-track{
  margin-top:28px;
  display:grid;
  gap:5px;
}
.screensaver-title{
  font-size:24px;
  line-height:1.1;
  font-weight:950;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.screensaver-artist{
  color:rgba(255,255,255,.72);
  font-size:15px;
  font-weight:750;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.screensaver-message{
  margin-top:22px;
  max-width:30rem;
  padding:13px 16px;
  border-radius:18px;
  background:rgba(255,255,255,.12);
  border:1px solid rgba(255,255,255,.16);
  color:rgba(255,255,255,.9);
  font-size:15px;
  font-weight:800;
  line-height:1.35;
}
.screensaver-next{
  margin-top:18px;
  width:min(100%, 24rem);
  padding:0;
  border-radius:0;
  background:transparent;
  border:0;
  box-shadow:none;
  backdrop-filter:none;
  text-shadow:0 10px 28px rgba(0,0,0,.42);
}
.screensaver-next[hidden]{display:none!important;}
.screensaver-next-label{
  display:block;
  margin:0 0 7px;
  color:rgba(255,255,255,.54);
  font-size:10px;
  font-weight:950;
  letter-spacing:0;
  text-transform:uppercase;
}
.screensaver-next-main{
  display:grid;
  grid-template-columns:40px minmax(0, 1fr);
  gap:10px;
  align-items:center;
}
.screensaver-next-art{
  width:40px;
  aspect-ratio:1;
  border-radius:12px;
  overflow:hidden;
  display:grid;
  place-items:center;
  color:rgba(255,255,255,.82);
  opacity:.86;
  background:transparent;
  border:0;
}
.screensaver-next-art img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
  animation:screensaverImageIn .28s ease-out;
}
.screensaver-next-art svg{
  width:22px;
  height:22px;
}
.screensaver-next-copy{
  min-width:0;
  display:grid;
  gap:3px;
}
.screensaver-next-title,
.screensaver-next-artist{
  display:block;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.screensaver-next-title{
  color:#fff;
  font-size:14px;
  font-weight:950;
}
.screensaver-next-artist{
  color:rgba(255,255,255,.66);
  font-size:12px;
  font-weight:800;
}
.screensaver-analog-clock{
  width:190px;
  aspect-ratio:1;
  border-radius:999px;
  display:none;
  position:relative;
  border:2px solid rgba(255,255,255,.32);
  background:radial-gradient(circle, rgba(255,255,255,.16), rgba(255,255,255,.05));
  box-shadow:inset 0 0 0 10px rgba(255,255,255,.05), 0 24px 60px rgba(0,0,0,.28);
}
.screensaver-hand{
  position:absolute;
  left:50%;
  bottom:50%;
  width:4px;
  border-radius:999px;
  transform:translateX(-50%) rotate(var(--hand-rotation, 0deg));
  transform-origin:50% 100%;
  background:#fff;
}
.screensaver-hand.hour{height:30%;}
.screensaver-hand.minute{height:40%;opacity:.9;}
.screensaver-hand.second{height:43%;width:2px;background:var(--ma-accent);}
.screensaver-pin{
  position:absolute;
  width:12px;
  height:12px;
  border-radius:999px;
  left:50%;
  top:50%;
  transform:translate(-50%, -50%);
  background:#fff;
  box-shadow:0 0 0 4px rgba(255,255,255,.18);
}
.screensaver-backdrop.analog-mode .screensaver-clock{display:none;}
.screensaver-backdrop.analog-mode .screensaver-analog-clock{display:block;}
.card.layout-tablet .screensaver-backdrop{
  padding:clamp(44px, 5.4vw, 76px);
}
.card.layout-tablet .screensaver-brand{
  display:block;
}
.card.layout-tablet .screensaver-shell{
  width:min(92vw, 1180px);
  grid-template-columns:minmax(320px, 430px) minmax(0, 1fr);
  gap:clamp(48px, 6.2vw, 86px);
}
.card.layout-tablet .screensaver-art{
  border-radius:36px;
  box-shadow:0 34px 90px rgba(0,0,0,.4);
}
.card.layout-tablet .screensaver-info{
  max-width:610px;
}
.card.layout-tablet .screensaver-clock{
  font-size:clamp(94px, 11.6vw, 190px);
  line-height:.84;
}
.card.layout-tablet .screensaver-analog-clock{
  width:clamp(236px, 27vw, 380px);
}
.card.layout-tablet .screensaver-track{
  margin-top:22px;
  gap:7px;
}
.card.layout-tablet .screensaver-title{
  font-size:clamp(30px, 3vw, 42px);
}
.card.layout-tablet .screensaver-artist{
  font-size:19px;
}
.card.layout-tablet .screensaver-message,
.card.layout-tablet .screensaver-next{
  max-width:clamp(310px, 31vw, 430px);
}
.card.layout-tablet .screensaver-next{
  position:static;
  width:min(100%, 390px);
  margin-top:clamp(18px, 2.2vh, 26px);
  padding:0;
  border-radius:0;
  background:transparent;
  border:0;
  box-shadow:none;
  backdrop-filter:none;
  text-shadow:0 10px 28px rgba(0,0,0,.46);
}
.card.layout-tablet .screensaver-next-main{
  grid-template-columns:40px minmax(0, 1fr);
  gap:10px;
}
.card.layout-tablet .screensaver-next-art{
  width:40px;
  border-radius:12px;
  opacity:.84;
  background:transparent;
  border:0;
}
.card.layout-tablet .screensaver-next-title{
  font-size:max(15px, 14px);
}
.card.layout-tablet .screensaver-next-artist{
  font-size:max(12px, 12px);
}
.card.layout-tablet .screensaver-backdrop.lyrics-mode .screensaver-shell{
  grid-template-columns:minmax(320px, 430px) minmax(0, 720px);
  gap:clamp(54px, 6.6vw, 94px);
}
@media (max-width: 720px), (max-height: 540px){
  .screensaver-backdrop.lyrics-mode .screensaver-shell{
    width:min(100%, 520px);
    grid-template-columns:1fr;
    gap:clamp(18px, 4vh, 28px);
    justify-items:center;
    text-align:center;
  }
  .screensaver-backdrop.lyrics-mode .screensaver-art-wrap{
    width:min(48vw, 220px);
    max-width:220px;
  }
  .screensaver-backdrop.lyrics-mode .screensaver-info{
    max-width:min(100%, 520px);
    justify-items:center;
    text-align:center;
  }
  .screensaver-backdrop.lyrics-mode .screensaver-track,
  .screensaver-backdrop.lyrics-mode .screensaver-lyrics{
    width:100%;
    max-width:min(100%, 520px);
    text-align:center;
  }
  .screensaver-backdrop.lyrics-mode .screensaver-title{
    font-size:clamp(22px, 6.2vw, 34px);
  }
  .screensaver-backdrop.lyrics-mode .screensaver-artist{
    font-size:clamp(13px, 3.6vw, 17px);
  }
  .screensaver-lyric-line{
    font-size:clamp(24px, 7.2vw, 38px);
    line-height:1.18;
  }
}
@media (min-width: 760px) and (min-height: 620px){
  .screensaver-backdrop{
    padding:clamp(44px, 5.4vw, 76px);
  }
  .screensaver-brand{
    display:block;
  }
  .screensaver-shell{
    width:min(92vw, 1180px);
    grid-template-columns:minmax(320px, 430px) minmax(0, 1fr);
    gap:clamp(48px, 6.2vw, 86px);
    align-items:end;
  }
  .screensaver-art{
    border-radius:36px;
    box-shadow:0 34px 90px rgba(0,0,0,.4);
  }
  .screensaver-info{
    max-width:560px;
    align-self:end;
    padding-block-end:clamp(6px, 1.2vw, 18px);
  }
  .screensaver-clock,
  .screensaver-analog-clock{
    position:absolute;
    top:var(--screensaver-clock-y, 24%);
    left:var(--screensaver-clock-x, 82%);
    right:auto;
    z-index:2;
    transform:translate(-50%, -50%) scale(var(--screensaver-clock-scale, 1));
    transform-origin:center;
      }
  .screensaver-backdrop.open .screensaver-clock,
  .screensaver-backdrop.open .screensaver-analog-clock{
    animation:screensaverClockGuard 137s ease-in-out infinite;
  }
  .screensaver-backdrop.empty-mode.open .screensaver-clock{
    animation:screensaverClockGuard 137s ease-in-out infinite, screensaverClockGlow 5.8s ease-in-out infinite;
  }
  .screensaver-backdrop.empty-mode.open .screensaver-analog-clock{
    animation:screensaverClockGuard 137s ease-in-out infinite, screensaverClockRingPulse 5.8s ease-in-out infinite;
  }
  .screensaver-clock{
    font-size:clamp(78px, 7.4vw, 128px);
    line-height:.9;
    text-align:center;
    white-space:nowrap;
  }
  .screensaver-analog-clock{
    width:clamp(204px, 20.4vw, 292px);
  }
  .screensaver-track{
    margin-top:18px;
    gap:7px;
  }
  .screensaver-title{
    font-size:clamp(30px, 3vw, 44px);
  }
  .screensaver-artist{
    font-size:19px;
  }
  .screensaver-message,
  .screensaver-next{
    max-width:clamp(310px, 31vw, 430px);
  }
  .screensaver-next{
    position:static;
    width:min(100%, 390px);
    margin-top:clamp(18px, 2.2vh, 26px);
    padding:0;
    border-radius:0;
    background:transparent;
    border:0;
    box-shadow:none;
    backdrop-filter:none;
    text-shadow:0 10px 28px rgba(0,0,0,.46);
  }
  .screensaver-next-main{
    grid-template-columns:40px minmax(0, 1fr);
    gap:10px;
  }
  .screensaver-next-art{
    width:40px;
    border-radius:12px;
    opacity:.84;
    background:transparent;
    border:0;
  }
  .screensaver-next-title{
    font-size:15px;
  }
  .screensaver-next-artist{
    font-size:12px;
  }
}
.theme-light .screensaver-brand{
  color:rgba(20,26,38,.34);
  filter:drop-shadow(0 12px 28px rgba(255,255,255,.22)) saturate(.86);
}
.theme-light .screensaver-voice-btn{
  color:rgba(31,38,51,.56);
  background:rgba(255,255,255,.28);
  border-color:rgba(141,155,177,.18);
  box-shadow:0 16px 34px rgba(111,126,150,.1), inset 0 1px 0 rgba(255,255,255,.45);
}
.theme-light .screensaver-voice-btn:hover,
.theme-light .screensaver-voice-btn:focus-visible,
.theme-light .screensaver-voice-btn.pressed,
.theme-light .screensaver-voice-btn.listening{
  color:#5f420f;
  background:linear-gradient(180deg, color-mix(in srgb, var(--ma-accent) 14%, white 86%), rgba(255,255,255,.62));
  border-color:color-mix(in srgb, var(--ma-accent) 36%, rgba(141,155,177,.2));
  box-shadow:0 20px 44px color-mix(in srgb, var(--ma-accent) 12%, rgba(111,126,150,.14)), 0 0 0 8px color-mix(in srgb, var(--ma-accent) 7%, transparent), inset 0 1px 0 rgba(255,255,255,.72);
}
`;
}
