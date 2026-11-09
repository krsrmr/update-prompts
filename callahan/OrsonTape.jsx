// 필요 훅: useState, useRef, useEffect (react)
// 오손의 녹음 테이프 v1.0 (!혼잣말) — 휴대용 카세트 녹음기 + 누렇게 바랜 연속 용지 녹취록
// 넓은 화면: 세로형 녹음기(테이프 세로) 옆으로 종이 / 좁은 화면: 가로형 녹음기(테이프 가로) 아래로 종이

function OrsonTape(props = {}) {
  const p = props || {};
  const H = tpHooks();
  const mkRef = H.r || ((v) => H.s(() => ({ current: v }))[0]);
  const rootRef = mkRef(null);
  const paperRef = mkRef(null);
  const [rootW, setRootW] = H.s(0);

  const tapeNo = String(Math.max(1, Math.round(Number(p.tape) || 1))).padStart(2, "0");
  const side = tpVal(p.side, "A").toUpperCase().slice(0, 1);
  const label = tpVal(p.label, "oz — don't tape over");
  const date = tpVal(p.date, "");
  const time = tpVal(p.time, "");
  const place = tpVal(p.place, "");
  const lines = tpList(p.lines).map(tpLine);
  const n = lines.length;

  const [idx, setIdx] = H.s(0);
  const [playing, setPlaying] = H.s(true);

  H.e(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const check = () => {
      const w = el.clientWidth;
      setRootW((v) => (v === w ? v : w));
    };
    check();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 한 줄씩 찍어 내기
  H.e(() => {
    if (!playing) return undefined;
    if (idx >= n) {
      setPlaying(false);
      return undefined;
    }
    const next = lines[idx];
    const len = (next.en || "").length + (next.ko || "").length * 0.5;
    const wait = idx === 0 ? 500 : Math.min(2400, 650 + len * 16);
    const id = setTimeout(() => setIdx((i) => i + 1), wait);
    return () => clearTimeout(id);
  }, [playing, idx, n]);

  H.e(() => {
    const el = paperRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [idx]);

  const shown = lines.slice(0, idx);
  const lastSec = shown.length ? tpSec(shown[shown.length - 1].t) : 0;
  const prog = n ? idx / n : 0;
  const done = idx >= n && n > 0;

  const press = (k) => {
    if (k === "rew") {
      setIdx(0);
      setPlaying(true);
    }
    if (k === "play") {
      if (done) setIdx(0);
      setPlaying(true);
    }
    if (k === "stop") setPlaying(false);
    if (k === "ff") {
      setIdx(n);
      setPlaying(false);
    }
  };

  const mono = "'Courier New', Courier, 'Nanum Gothic Coding', monospace";
  const sans = "'Helvetica Neue', Helvetica, Arial, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";
  const hand = "'Segoe Print', 'Bradley Hand', 'Comic Neue', 'Nanum Pen Script', cursive";

  // ── 카세트 (가로로 그림. 넓은 화면에선 세로로 눕힘)
  const hub = (cx, cy) => (
    <g transform={"translate(" + cx + " " + cy + ")"}>
      <g className={"tp-spin" + (playing ? "" : " tp-paused")}>
        <circle r="9.5" fill="#f1eee6" stroke="#cfc9bb" strokeWidth="0.8" />
        <circle r="4.6" fill="#2a2724" />
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <rect key={k} x="-1" y="-7.6" width="2" height="3.2" fill="#2a2724" transform={"rotate(" + k * 60 + ")"} />
        ))}
      </g>
    </g>
  );
  const rL = 30 - prog * 14;
  const rR = 16 + prog * 14;
  const cassette = (
    <svg width="165" height="104" viewBox="0 0 165 104" style={{ display: "block" }}>
      <defs>
        <clipPath id="tpWin">
          <rect x="38" y="32" width="89" height="28" rx="14" />
        </clipPath>
      </defs>
      <rect x="0.5" y="0.5" width="164" height="103" rx="7" fill="#2b2926" stroke="#11100f" />
      <rect x="3" y="3" width="159" height="98" rx="5.5" fill="none" stroke="rgba(255,255,255,.06)" />
      {[[7, 7], [158, 7], [7, 97], [158, 97], [82.5, 92]].map((c, i) => (
        <circle key={i} cx={c[0]} cy={c[1]} r="2.2" fill="#151413" stroke="#3d3a36" strokeWidth="0.6" />
      ))}
      <rect x="10" y="8" width="145" height="62" rx="3" fill="#efe6cf" />
      <rect x="10" y="8" width="145" height="7" rx="2" fill="#c8572e" />
      <text x="16" y="29" fontFamily={sans} fontSize="13" fontWeight="800" fill="#2b2926">{side}</text>
      {[40, 48, 56, 64].map((y) => (
        <line key={y} x1="28" y1={y} x2="148" y2={y} stroke="rgba(43,41,38,.12)" strokeWidth="0.6" />
      ))}
      <text x="88" y="27" textAnchor="middle" fontFamily={hand} fontSize="9.5" fill="#2f3a62">{label.length > 28 ? label.slice(0, 28) : label}</text>
      <rect x="36" y="30" width="93" height="32" rx="16" fill="#efe6cf" />
      <g clipPath="url(#tpWin)">
        <rect x="38" y="32" width="89" height="28" fill="#1b1612" />
        <circle cx="55" cy="46" r={rL} fill="#3d2a1a" />
        <circle cx="110" cy="46" r={rR} fill="#3d2a1a" />
      </g>
      <rect x="38" y="32" width="89" height="28" rx="14" fill="none" stroke="#1a1714" strokeWidth="1.2" />
      {hub(55, 46)}
      {hub(110, 46)}
      <path d="M38 104 L48 79 L117 79 L127 104 Z" fill="#232120" stroke="#141312" strokeWidth="0.8" />
      <circle cx="66" cy="94" r="2.6" fill="#0e0d0c" />
      <circle cx="99" cy="94" r="2.6" fill="#0e0d0c" />
      <rect x="77" y="86" width="11" height="7" rx="1" fill="#0e0d0c" />
      <line x1="30" y1="101" x2="135" y2="101" stroke="#4a3320" strokeWidth="1.4" />
    </svg>
  );

  // ── 녹음기 몸체
  const digits = String(Math.min(999, lastSec)).padStart(3, "0");
  const key = (k, label, on, red, h) => (
    <div
      key={k}
      onClick={() => press(k)}
      title={{ rec: "녹음", rew: "처음부터", play: "재생", ff: "끝까지", stop: "정지" }[k]}
      style={{
        flex: 1,
        height: h || 30,
        borderRadius: h ? "4px 4px 3px 3px" : "3px 3px 5px 5px",
        cursor: k === "rec" ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: sans,
        fontSize: 10,
        fontWeight: 700,
        color: red ? "#d23b2a" : "#3b3833",
        background: on ? "linear-gradient(#a9a49a, #c9c4b9)" : "linear-gradient(#e9e6df, #c7c2b7)",
        boxShadow: on ? "inset 0 2px 3px rgba(0,0,0,.35)" : "0 3px 0 #77726a, 0 4px 5px rgba(0,0,0,.35)",
        transform: on ? "translateY(2px)" : "none",
        userSelect: "none",
      }}
    >
      {label}
    </div>
  );

  const bodyBg = "linear-gradient(160deg, #3c3a37 0%, #262523 60%, #1c1b19 100%)";
  const bodyShadow = "inset 0 1px 0 rgba(255,255,255,.12), inset 0 -2px 4px rgba(0,0,0,.4), 0 16px 30px rgba(0,0,0,.5)";
  const grille = (h, tapeStyle) => (
    <div style={{ position: "relative", height: h, borderRadius: 8, background: "radial-gradient(circle, #0c0c0b 1.5px, transparent 1.9px) 0 0 / 7px 7px, linear-gradient(#2f2d2a, #252422)", boxShadow: "inset 0 1px 3px rgba(0,0,0,.6)" }}>
      <div style={Object.assign({ position: "absolute", padding: "3px 7px 2px", background: "linear-gradient(#efe3c2, #e2d3ac)", boxShadow: "0 1px 2px rgba(0,0,0,.35)", fontFamily: hand, fontSize: 10.5, color: "#3a3226" }, tapeStyle)}>OZ</div>
    </div>
  );
  const led = (withText) => (
    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span className={playing ? "tp-led" : ""} style={{ width: 7, height: 7, borderRadius: "50%", background: playing ? "#7be07a" : "#3b4a3a", boxShadow: playing ? "0 0 6px rgba(123,224,122,.9)" : "none" }} />
      {withText ? <span style={{ fontFamily: sans, fontSize: 8.5, letterSpacing: 1.2, color: "#9a968e" }}>{done ? "END" : playing ? "PLAY" : "STOP"}</span> : null}
    </span>
  );
  const counter = (
    <span style={{ marginLeft: "auto", display: "flex", gap: 2, padding: 2, borderRadius: 3, background: "#0d0c0b", boxShadow: "inset 0 1px 2px rgba(0,0,0,.8)" }}>
      {digits.split("").map((d, i) => (
        <span key={i} style={{ width: 12, height: 17, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 1, background: "linear-gradient(#2a2826 50%, #22201e 50%)", fontFamily: mono, fontSize: 12, fontWeight: 700, color: "#ecebe6" }}>{d}</span>
      ))}
    </span>
  );
  const keys = (h) => [
    key("rec", "●", false, true, h),
    key("rew", "◀◀", false, false, h),
    key("play", "▶", playing, false, h),
    key("ff", "▶▶", false, false, h),
    key("stop", "■", !playing, false, h),
  ];
  const glare = <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(115deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,0) 32%), linear-gradient(rgba(60,40,20,.10), rgba(60,40,20,.10))" }} />;
  const winStyle = { position: "relative", borderRadius: 10, overflow: "hidden", background: "linear-gradient(#141312, #1d1b19)", boxShadow: "inset 0 2px 6px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.05)" };

  // 세로형 (넓은 화면): 테이프를 세로로 눕힘
  const recorder = (
    <div style={{ position: "relative", width: 178, boxSizing: "border-box", padding: "16px 13px 16px", borderRadius: 16, background: bodyBg, boxShadow: bodyShadow }}>
      {grille(44, { right: -6, top: -9, transform: "rotate(6deg)" })}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 2px 6px", fontFamily: sans, fontSize: 8, letterSpacing: 1.2, color: "#8d8a83" }}>
        <span>VOICE</span>
        <span>AUTO STOP</span>
      </div>
      <div style={Object.assign({ height: 182 }, winStyle)}>
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 165, height: 104, transform: "translate(-50%, -50%) rotate(-90deg)" }}>{cassette}</div>
        {glare}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "11px 2px 10px" }}>
        {led(true)}
        {counter}
      </div>
      <div style={{ display: "flex", gap: 4 }}>{keys()}</div>
    </div>
  );

  // 가로형 (좁은 화면): 테이프를 가로로, 건반은 윗면에
  const HW = Math.min(340, Math.max(296, rootW - 8));
  const WIN_W = 174;
  const leftW = HW - 24 - 10 - WIN_W;
  const recorderH = (
    <div style={{ position: "relative", width: HW, paddingTop: 13 }}>
      <div style={{ position: "absolute", top: 0, right: 16, width: WIN_W - 8, display: "flex", gap: 4, zIndex: 2 }}>{keys(26)}</div>
      <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 10, boxSizing: "border-box", padding: "20px 12px 12px", borderRadius: 16, background: bodyBg, boxShadow: bodyShadow }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", margin: "-2px 1px 5px", fontFamily: sans, fontSize: 7.5, letterSpacing: 1, color: "#8d8a83", whiteSpace: "nowrap", overflow: "hidden" }}>
            <span>VOICE</span>
            {leftW >= 104 ? <span>AUTO STOP</span> : null}
          </div>
          <div style={{ flex: 1 }}>{grille(66, { left: -5, bottom: -8, transform: "rotate(-5deg)" })}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
            {led(leftW >= 104)}
            {counter}
          </div>
        </div>
        <div style={Object.assign({ flexShrink: 0, width: WIN_W, height: 112 }, winStyle)}>
          <div style={{ position: "absolute", left: "50%", top: "50%", width: 165, height: 104, transform: "translate(-50%, -50%)" }}>{cassette}</div>
          {glare}
        </div>
      </div>
    </div>
  );

  // ── 녹취록 (연속 용지, 누렇게 바랜 종이)
  const OVER = 22;
  const RW = 178;
  const sideBy = rootW >= RW + 290 - OVER;
  const PW = sideBy ? Math.min(330, rootW - RW + OVER) : HW - 18;
  const padL = sideBy ? OVER : 0;
  const padT = sideBy ? 0 : 22;
  const PH = sideBy ? 340 : 320;
  const band = 18;
  const PAPER = "#f0e4c3";
  const BAR = "#e6e1bf";

  const sprocket = (pos) => (
    <div style={{ position: "absolute", top: 0, bottom: 0, [pos]: 0, width: 16, background: PAPER, borderLeft: pos === "right" ? "1px dashed #cdbd93" : "none", borderRight: pos === "left" ? "1px dashed #cdbd93" : "none", backgroundImage: "radial-gradient(circle at 50% 50%, rgba(74,58,30,.30) 0 3.1px, rgba(150,124,74,.35) 3.2px 3.7px, transparent 3.8px)", backgroundSize: "16px 18px", backgroundPosition: "0 6px", backgroundRepeat: "repeat-y" }} />
  );

  const paper = (
    <div style={{ position: "relative", width: PW, height: PH, boxSizing: "border-box", background: PAPER, boxShadow: "0 14px 28px rgba(0,0,0,.32), 0 0 0 1px rgba(90,70,30,.12)", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: padL, right: 0 }}>
        {sprocket("left")}
        {sprocket("right")}
        <div ref={paperRef} className="tp-scroll" style={{ position: "absolute", top: 0, bottom: 0, left: 17, right: 17, overflowY: "auto", padding: padT + 14 + "px 12px 18px", boxSizing: "border-box", background: "repeating-linear-gradient(" + PAPER + " 0 " + band * 2 + "px, " + BAR + " " + band * 2 + "px " + band * 4 + "px)", backgroundAttachment: "local" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, fontFamily: mono, lineHeight: band + "px", color: "#2c261b" }}>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2 }}>TRANSCRIPT</span>
            <span style={{ fontSize: 11, letterSpacing: 1, color: "#6c624b", whiteSpace: "nowrap" }}>{"TAPE " + tapeNo + " / " + side}</span>
          </div>
          <div style={{ fontFamily: sans, fontSize: 11, color: "#6c624b", lineHeight: band + "px" }}>{[date, time, place].filter(Boolean).join(" · ")}</div>
          <div style={{ fontFamily: mono, fontSize: 11, color: "#b0a27c", lineHeight: band + "px", overflow: "hidden", whiteSpace: "nowrap" }}>{"- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -"}</div>
          {shown.map((l, i) => {
            const last = i === shown.length - 1;
            return (
              <div key={i} className="tp-line" style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <span style={{ flexShrink: 0, fontFamily: mono, fontSize: 11, color: "#8f8463", lineHeight: band + "px" }}>{"[" + l.t + "]"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {l.cue ? (
                    <div style={{ fontFamily: mono, fontSize: 11.5, fontStyle: "italic", color: "#736a52", lineHeight: band + "px", wordBreak: "keep-all" }}>
                      {l.cue}
                      {last && playing ? <span className="tp-caret">▌</span> : null}
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontFamily: mono, fontSize: 12, color: "#241f16", lineHeight: band + "px", wordBreak: "break-word" }}>
                        {l.en}
                        {last && playing && !l.ko ? <span className="tp-caret">▌</span> : null}
                      </div>
                      {l.ko ? (
                        <div style={{ fontFamily: sans, fontSize: 11.5, color: "#5b533f", lineHeight: "17px", wordBreak: "keep-all" }}>
                          {l.ko}
                          {last && playing ? <span className="tp-caret">▌</span> : null}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {done ? <div className="tp-line" style={{ marginTop: 12, textAlign: "center", fontFamily: mono, fontSize: 11, letterSpacing: 2, color: "#8f8463" }}>{"— END OF SIDE " + side + " —"}</div> : null}
          {!shown.length && !done ? <div style={{ marginTop: 6, fontFamily: mono, fontSize: 11.5, color: "#a39673" }}><span className="tp-caret">▌</span></div> : null}
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(circle at 88% 9%, transparent 0 25px, rgba(140,92,36,.13) 26px 28px, rgba(140,92,36,.05) 29px 31px, transparent 32px), radial-gradient(ellipse at 50% 45%, transparent 58%, rgba(132,96,40,.17) 100%), linear-gradient(90deg, rgba(120,90,40,.06), transparent 18%, transparent 82%, rgba(120,90,40,.06))" }} />
    </div>
  );

  return (
    <div ref={rootRef} style={{ width: "100%", boxSizing: "border-box", padding: "6px 0 10px" }}>
      <style>{TP_CSS}</style>
      {sideBy ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
          <div style={{ position: "relative", zIndex: 2, flexShrink: 0 }}>{recorder}</div>
          <div style={{ position: "relative", zIndex: 1, marginLeft: -OVER, marginTop: 30 }}>{paper}</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ position: "relative", zIndex: 2 }}>{recorderH}</div>
          <div style={{ position: "relative", zIndex: 1, marginTop: -22 }}>{paper}</div>
        </div>
      )}
    </div>
  );
}

function tpHooks() {
  const R = typeof React !== "undefined" && React ? React : {};
  return {
    s: R.useState || (typeof useState === "function" ? useState : null),
    e: R.useEffect || (typeof useEffect === "function" ? useEffect : null),
    r: R.useRef || (typeof useRef === "function" ? useRef : null),
  };
}

function tpVal(v, d) {
  if (v === undefined || v === null) return d;
  const s = String(v).trim();
  return s === "" || s === "undefined" || s === "null" ? d : s;
}

function tpList(v) {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (v === undefined || v === null) return [];
  const s = String(v).trim();
  if (!s) return [];
  if (s.charAt(0) === "[") {
    try {
      const a = JSON.parse(s);
      if (Array.isArray(a)) return a.map((x) => String(x).trim()).filter(Boolean);
    } catch (e) {}
  }
  return s.split(/\n|;/).map((x) => x.trim()).filter(Boolean);
}

// "시간|영어 원문|한국어 뜻"  또는  "시간|(소리·침묵)"
function tpLine(s) {
  const a = String(s).split("|").map((x) => x.trim());
  const t = a[0] || "00:00";
  const b = a[1] || "";
  if (/^[(（]/.test(b)) return { t, cue: b, en: "", ko: "" };
  return { t, cue: "", en: b, ko: a[2] || "" };
}

function tpSec(t) {
  const m = String(t || "").match(/(\d+):(\d+)/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
}

const TP_CSS = `
@keyframes tpSpin { to { transform: rotate(360deg); } }
.tp-spin { animation: tpSpin 2.2s linear infinite; transform-box: fill-box; transform-origin: center; }
.tp-spin.tp-paused { animation-play-state: paused; }
@keyframes tpLine { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: none; } }
.tp-line { animation: tpLine .35s ease-out both; }
@keyframes tpBlink { 50% { opacity: 0; } }
.tp-caret { margin-left: 2px; color: #3a3933; animation: tpBlink 1s step-end infinite; }
.tp-led { animation: tpBlink 1.6s step-end infinite; }
.tp-scroll { scrollbar-width: thin; scrollbar-color: #cdbd93 transparent; }
.tp-scroll::-webkit-scrollbar { width: 6px; }
.tp-scroll::-webkit-scrollbar-thumb { background: #cdbd93; border-radius: 3px; }
@media (prefers-reduced-motion: reduce) { .tp-spin, .tp-line, .tp-caret, .tp-led { animation: none !important; } }
`;
