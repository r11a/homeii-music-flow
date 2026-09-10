// Classic fullscreen styles. Original cascade order is preserved.
export default `          .immersive-backdrop {
            position:absolute;
            inset:0;
            z-index:120;
            display:none;
            overflow:hidden;
            border-radius:inherit;
            background:rgba(8,12,18,0.38);
          }
          .immersive-backdrop.open { display:block; }
          .immersive-shell {
            position:relative;
            width:100%;
            height:100%;
            overflow:hidden;
            display:grid;
            grid-template-rows:auto minmax(0,1fr) auto;
            gap:clamp(14px, 2.2vw, 24px);
            padding:clamp(16px, 2.2vw, 28px);
            color:#f7f8fc;
            direction:ltr;
          }
          .immersive-shell.rtl { direction:rtl; }
          .immersive-bg,
          .immersive-cover-glow,
          .immersive-frost,
          .immersive-vignette {
            position:absolute;
            inset:0;
            pointer-events:none;
          }
          .immersive-bg,
          .immersive-cover-glow {
            background-position:center;
            background-size:cover;
            transform:scale(1.12);
            filter:blur(34px) saturate(1.08);
            opacity:0.9;
          }
          .immersive-cover-glow::after {
            content:"";
            position:absolute;
            inset:0;
            background:
              radial-gradient(circle at center, transparent 18%, rgba(8,12,18,0.34) 62%, rgba(8,12,18,0.72) 100%),
              linear-gradient(180deg, rgba(8,12,18,0.22), rgba(8,12,18,0.52));
          }
          .immersive-frost {
            background:
              radial-gradient(circle at top, rgba(224,161,27,0.14), transparent 34%),
              linear-gradient(180deg, rgba(16,18,26,0.26), rgba(12,14,20,0.58));
            backdrop-filter:blur(18px);
            -webkit-backdrop-filter:blur(18px);
          }
          .immersive-vignette {
            background:
              radial-gradient(circle at center, transparent 18%, rgba(8,12,18,0.34) 62%, rgba(8,12,18,0.72) 100%),
              linear-gradient(180deg, rgba(8,12,18,0.22), rgba(8,12,18,0.52));
          }
          .immersive-topbar,
          .immersive-stage,
          .immersive-footer,
          .immersive-header,
          .immersive-body,
          .immersive-panel {
            position:relative;
            z-index:1;
          }
          .immersive-topbar {
            display:flex;
            align-items:flex-start;
            justify-content:space-between;
            gap:16px;
          }
          .immersive-shell.rtl .immersive-topbar {
            flex-direction:row-reverse;
          }
          .immersive-header {
            display:flex;
            align-items:flex-start;
            justify-content:space-between;
            gap:16px;
          }
          .immersive-shell.rtl .immersive-header {
            flex-direction:row-reverse;
          }
          .immersive-backdrop .close-btn {
            width:58px;
            height:58px;
            border-radius:999px;
            background:rgba(255,255,255,0.18);
            color:#121212;
            border-color:rgba(255,255,255,0.22);
            box-shadow:0 12px 24px rgba(0,0,0,0.18);
            backdrop-filter:blur(10px);
            -webkit-backdrop-filter:blur(10px);
            flex:0 0 auto;
          }
          .immersive-meta {
            display:grid;
            gap:8px;
            min-width:0;
            text-align:start;
            max-width:min(44vw, 520px);
          }
          .immersive-shell.rtl .immersive-meta { text-align:right; }
          .immersive-kicker {
            font-size:12px;
            letter-spacing:.16em;
            text-transform:uppercase;
            color:rgba(255,255,255,0.72);
          }
          .immersive-title {
            font-size:clamp(24px, 3.4vw, 40px);
            line-height:1.04;
            font-weight:900;
            letter-spacing:-0.03em;
            text-shadow:0 10px 24px rgba(0,0,0,0.28);
            word-break:break-word;
          }
          .immersive-subtitle {
            font-size:clamp(14px, 1.35vw, 18px);
            color:rgba(255,255,255,0.84);
            text-shadow:0 8px 22px rgba(0,0,0,0.24);
            word-break:break-word;
          }
          .immersive-player-pill {
            display:inline-flex;
            align-items:center;
            gap:8px;
            width:fit-content;
            max-width:100%;
            min-height:38px;
            padding:0 14px;
            border-radius:999px;
            background:rgba(18,20,28,0.34);
            border:1px solid rgba(255,255,255,0.14);
            color:rgba(255,255,255,0.88);
            font-size:12px;
            font-weight:700;
            backdrop-filter:blur(12px);
            -webkit-backdrop-filter:blur(12px);
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          }
          .immersive-stage,
          .immersive-body {
            min-height:0;
            display:grid;
            place-items:center;
            align-content:center;
            gap:clamp(20px, 3vw, 36px);
          }
          .immersive-art-wrap {
            width:min(100%, 620px);
            display:grid;
            place-items:center;
          }
          .immersive-art {
            width:min(100%, min(54vh, 620px));
            max-width:min(86vw, 620px);
            max-height:min(54vh, 620px);
            aspect-ratio:1/1;
            border-radius:32px;
            overflow:hidden;
            border:1px solid rgba(255,255,255,0.18);
            background:rgba(255,255,255,0.08);
            box-shadow:0 28px 80px rgba(0,0,0,0.34);
            display:grid;
            place-items:center;
            font-size:72px;
            color:rgba(255,255,255,0.5);
          }
          .immersive-art img {
            width:100%;
            height:100%;
            object-fit:contain;
            object-position:center;
            display:block;
          }
          .immersive-body {
            grid-template-rows:minmax(0,1fr) auto;
            gap:clamp(28px, 3.6vw, 44px);
          }
          .immersive-body > .immersive-art-wrap {
            align-self:center;
          }
          .immersive-track-pill {
            display:inline-flex;
            align-items:center;
            justify-content:center;
            gap:10px;
            max-width:min(92%, 720px);
            padding:12px 18px;
            border-radius:18px;
            background:rgba(18,20,28,0.36);
            border:1px solid rgba(255,255,255,0.14);
            backdrop-filter:blur(14px);
            -webkit-backdrop-filter:blur(14px);
            box-shadow:0 12px 28px rgba(0,0,0,0.18);
            text-align:center;
          }
          .immersive-track-pill .immersive-title,
          .immersive-track-pill .immersive-subtitle {
            font-size:inherit;
            line-height:1.2;
            text-shadow:none;
          }
          .immersive-track-pill-text {
            display:grid;
            gap:4px;
            min-width:0;
          }
          .immersive-track-pill-title {
            font-size:clamp(16px, 1.5vw, 22px);
            font-weight:800;
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          }
          .immersive-track-pill-sub {
            font-size:clamp(12px, 1vw, 15px);
            color:rgba(255,255,255,0.78);
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          }
          .immersive-footer,
          .immersive-panel {
            display:grid;
            gap:clamp(12px, 1.8vw, 18px);
            align-self:end;
          }
          .immersive-panel {
            width:min(100%, 1180px);
            margin:0 auto;
            padding-top:clamp(10px, 2vh, 24px);
            background:transparent;
            border:none;
            box-shadow:none;
            grid-template-columns:minmax(210px, 320px) minmax(0, 1fr);
            align-items:end;
          }
          .immersive-panel > .immersive-time-row,
          .immersive-panel > .immersive-progress,
          .immersive-panel > .immersive-controls {
            grid-column:1 / -1;
          }
          .immersive-time-row {
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:12px;
            color:rgba(255,255,255,0.82);
            font-size:14px;
            padding:0 6px;
            direction:ltr;
          }
          .immersive-progress {
            position:relative;
            width:min(100%, 1180px);
            margin:0 auto;
            height:14px;
            border-radius:999px;
            background:rgba(255,255,255,0.16);
            overflow:hidden;
            cursor:pointer;
            touch-action:none;
            box-shadow:inset 0 1px 0 rgba(255,255,255,0.1);
          }
          .immersive-progress-fill {
            height:100%;
            width:0%;
            border-radius:inherit;
            background:linear-gradient(90deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 76%, white 24%));
          }
          .immersive-controls {
            display:flex;
            align-items:center;
            justify-content:center;
            gap:clamp(12px, 1.8vw, 20px);
            flex-wrap:nowrap;
            direction:ltr;
          }
          .immersive-btn {
            width:86px;
            height:86px;
            border-radius:999px;
            border:1px solid rgba(255,255,255,0.15);
            background:rgba(255,255,255,0.12);
            color:#fff;
            display:grid;
            place-items:center;
            font-size:32px;
            box-shadow:0 16px 32px rgba(0,0,0,0.22);
            backdrop-filter:blur(12px);
            -webkit-backdrop-filter:blur(12px);
            display:grid;
            place-items:center;
          }
          .immersive-btn.primary {
            width:126px;
            height:126px;
            font-size:48px;
            background:rgba(255,255,255,0.18);
          }
          .immersive-btn.small {
            width:72px;
            height:72px;
            font-size:26px;
            background:rgba(255,255,255,0.1);
          }
          .immersive-btn.active {
            border-color:rgba(255,220,140,0.74);
            box-shadow:0 0 0 2px rgba(255,220,140,0.24), 0 16px 32px rgba(0,0,0,0.22);
          }
          .immersive-bottom-row {
            width:min(100%, 1180px);
            margin:0 auto;
            display:grid;
            grid-template-columns:minmax(0, 1fr) minmax(220px, 360px);
            gap:18px;
            align-items:center;
          }
          .immersive-actions {
            display:flex;
            align-items:center;
            justify-content:flex-end;
            gap:10px;
            flex-wrap:wrap;
          }
          .immersive-actions .chip-btn {
            background:rgba(18,20,28,0.34);
            color:#fff;
            border-color:rgba(255,255,255,0.16);
            backdrop-filter:blur(10px);
            -webkit-backdrop-filter:blur(10px);
            min-height:40px;
            padding:0 12px;
          }
          .immersive-player-picker-btn,
          .now-player-picker-btn {
            width:calc(46px * var(--ma-ui-scale));
            min-width:calc(46px * var(--ma-ui-scale));
            min-height:calc(46px * var(--ma-ui-scale));
            padding:0;
            border-radius:calc(16px * var(--ma-ui-scale));
            flex:0 0 auto;
          }
          .immersive-player-picker-btn .ui-ic,
          .now-player-picker-btn .ui-ic {
            width:18px;
            height:18px;
          }
          .immersive-volume {
            display:grid;
            grid-template-columns:auto minmax(0,1fr);
            align-items:center;
            gap:12px;
            direction:ltr;
            max-width:300px;
            padding:6px 12px;
            border-radius:999px;
            background:rgba(18,20,28,0.34);
            border:1px solid rgba(255,255,255,0.14);
            backdrop-filter:blur(12px);
            -webkit-backdrop-filter:blur(12px);
          }
          .immersive-volume input {
            width:100%;
            appearance:none;
            height:8px;
            border-radius:999px;
            outline:none;
            background:linear-gradient(to right, var(--ma-accent) 0%, var(--ma-accent) var(--vol-pct, 50%), rgba(255,255,255,0.28) var(--vol-pct, 50%), rgba(255,255,255,0.28) 100%);
          }
          .immersive-volume input::-webkit-slider-thumb {
            appearance:none;
            width:18px;
            height:18px;
            border-radius:50%;
            background:var(--ma-accent);
            border:none;
          }
          .immersive-volume input::-moz-range-thumb {
            width:18px;
            height:18px;
            border-radius:50%;
            background:var(--ma-accent);
            border:none;
          }
          .immersive-panel .immersive-actions,
          .immersive-panel .immersive-volume {
            margin:0;
          }
          .immersive-panel > .immersive-volume {
            grid-column:1;
            width:100%;
            justify-self:stretch;
          }
          .immersive-panel .immersive-actions {
            grid-column:2;
            width:auto;
            justify-self:end;
          }
          @media (max-width:1024px) {
            .immersive-art {
              width:min(100%, min(50vh, 560px));
              max-width:min(86vw, 560px);
              max-height:min(50vh, 560px);
            }
            .immersive-btn {
              width:78px;
              height:78px;
              font-size:29px;
            }
            .immersive-btn.primary {
              width:112px;
              height:112px;
              font-size:42px;
            }
          }
          @media (max-width:760px) {
            .immersive-shell {
              padding:14px;
              grid-template-rows:auto minmax(0,1fr) auto;
            }
            .immersive-art {
              width:min(100%, min(42vh, 420px));
              max-width:min(88vw, 420px);
              max-height:min(42vh, 420px);
              border-radius:24px;
            }
            .immersive-body {
              gap:12px;
            }
            .immersive-topbar {
              gap:12px;
            }
            .immersive-header {
              gap:12px;
            }
            .immersive-bottom-row {
              grid-template-columns:1fr;
              gap:12px;
            }
            .immersive-panel {
              grid-template-columns:1fr;
            }
            .immersive-actions {
              order:2;
              justify-content:center;
            }
            .immersive-volume {
              order:1;
              max-width:none;
            }
            .immersive-panel .immersive-actions,
            .immersive-panel .immersive-volume {
              width:100%;
            }
            .immersive-panel > .immersive-volume,
            .immersive-panel .immersive-actions {
              grid-column:1;
              justify-self:stretch;
            }
            .immersive-btn {
              width:64px;
              height:64px;
              font-size:24px;
            }
            .immersive-btn.small {
              width:56px;
              height:56px;
              font-size:21px;
            }
            .immersive-btn.primary {
              width:86px;
              height:86px;
              font-size:34px;
            }
          }
`;
